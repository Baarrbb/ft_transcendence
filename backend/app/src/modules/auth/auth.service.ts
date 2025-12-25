import HttpError from '../../utils/httpError.ts';
import type { FastifyInstance } from 'fastify';
import type { AuthResponse, AuthErrors, ValidateToken } from '@shared/types/auth.ts';
import { RegisterDataSchema, UpdatePasswordSchema } from './auth.schema.ts';
import dbAuth from './auth.model.ts';
import dbUsers from '../users/users.model.ts';
import bcrypt from 'bcrypt';
import { randomUUID, randomBytes } from 'crypto';
import { getDatabase } from '../../db.ts'
import twofactor from 'node-2fa';
import { config } from '../../config.ts'
import { transporter } from '../../utils/mailer.ts'


function createErrorResponse(msg: string, errors: AuthErrors): AuthResponse {
	return {
		success: false,
		message: msg,
		errors
	};
}

function validateAndCheckExistence(email: string, username: string, password: string): AuthResponse {
	const allErrors: AuthErrors = {};

	const checkFormat = RegisterDataSchema.safeParse({ email, username, password });
	if (!checkFormat.success) {
		checkFormat.error.issues.forEach(error => {
			const field = error.path[0] as keyof AuthErrors;
			if (!allErrors[field]) {
				allErrors[field] = [];
			}
			allErrors[field]!.push(error.message);
		});
	}

	try {
		if (!allErrors.email) {
			const existingEmail = dbUsers.getUsersByEmail(email);
			if (existingEmail.length > 0)
				allErrors.email = ["Email already exists"];
		}
		if (!allErrors.username) {
			const existingUsername = dbUsers.getUsersByUsername(username);
			if (existingUsername.length > 0)
				allErrors.username = ["Username already exists"];
		}

		if (Object.keys(allErrors).length > 0)
			return createErrorResponse("Data problem", allErrors);
	
		return { 
			success: true,
			message: "Format OK"
		};
	}
	catch (error) {
		throw new HttpError(500, "Database unavailable");
	}
}

export async function signUpUser(email: string, username: string, password: string): Promise<AuthResponse> {

	try {
		const validatedInput = validateAndCheckExistence(email, username, password);
		if (!validatedInput.success)
			return validatedInput;

		const hashedPassword = await bcrypt.hash(password, 10);
		const userId = randomUUID();

		try {
			const db = getDatabase();
			const transaction = db.transaction(() => {
				dbUsers.createUser(email, username, hashedPassword, userId);
				dbAuth.createUserAuthentification(userId);
			});

			transaction();
		}
		catch (dbError) {
			throw new HttpError(500, "Failed to create user account");
		}

		return {
			success: true,
			message: "User created successfuly",
			user: { user_id: userId }
		};
	}
	catch (error) {
		throw error;
	}
}

// export async function loginUser(fastify: FastifyInstance, username: string, password: string, remember: boolean): Promise<AuthResponse> {
export async function loginUser(fastify: FastifyInstance, username: string, password: string): Promise<AuthResponse> {
	try {
		const allErrors: AuthErrors = {};
		if (!username)
			allErrors.username = ["Username/email cannot be emtpy"];
		if (!password)
			allErrors.password = ["Password cannot be emtpy"];
		if (Object.keys(allErrors).length > 0)
			return createErrorResponse("Data problem", allErrors);

		let existingUser = dbUsers.getUserByUsername(username);
		if (!existingUser) {
			existingUser = dbUsers.getUserByEmail(username);
			if (!existingUser)
				return createErrorResponse('Invalid username/email or password', {});
		}

		const isPasswordValid = await bcrypt.compare(password, existingUser.password);
		if (!isPasswordValid)
			return createErrorResponse('Invalid username/email or password', {});

		const userAuthRow = dbAuth.getUserAuthentificationRow(existingUser.user_id);
		if (!userAuthRow)
			throw new HttpError(500, "Authentification service error");

		if (userAuthRow.is_totp_enabled) {
			const has2fa = fastify.jwt.sign(
				{ userId: existingUser.user_id, },
				{ expiresIn: '5min' }
			);
			return {
				success: false,
				message: "TOTP verification required",
				user: {
					totp_required: true
				},
				has2fa
			};
		}
		// else
		// 	dbUsers.updateUserRemember(remember, existingUser.user_id);

		return {
			success: true,
			message: "User login successfuly",
			user: { user_id: existingUser.user_id }
		};
	}
	catch (error) {
		throw error;
	}
}

export async function logoutUser(sessionToken: string, userId: string, tokenId: string): Promise<AuthResponse> {
	try {

		const db = getDatabase();
		const transaction = db.transaction(() => {
			dbAuth.deleteSessionBySessionToken(sessionToken);
			// dbAuth.deleteJWTByUserId(userId);
			// runQuery('DELETE FROM jwt WHERE id = ?', [tokenId]);
		});

		transaction();

		return {
			success: true,
			message: "Logout successfully",
		};
	}
	catch (error) {
		throw error;
	}
}

export async function forgotPassword(email: string): Promise<AuthResponse> {

	if (!email?.trim())
		return createErrorResponse("Email empty", { email: ["Email required"] });
	try {
		const user = dbUsers.getUserByEmail(email);
		if (!user)
			return createErrorResponse('Email not found', {});
	
		const token = randomBytes(32).toString('hex');
		const resetLink = `${config.frontendHost}/reset-password?token=${token}`;
		console.log(resetLink);

		try {
			await transporter.verify();
		}
		catch (error) {
			throw new HttpError(503, "Email service unavailable");
		}

		await transporter.sendMail({
			from: config.emailUser,
			to: email,
			subject: "Password Reset Request",
			text: `Click to reset your password: ${resetLink}`,
			// ajouter message pour dire que lien valable 1h
		});

		const expiry = new Date(Date.now() + 1000 * 60 * 60);
		dbAuth.updateUserResetToken(user.user_id, token, expiry.toISOString());

		return {
			success: true,
			message: "Reset email send successfuly",
		};
	}
	catch (error) {
		throw error;
	}
}

export async function checkResetToken(token: string): Promise<ValidateToken> {
	if (!token) {
		return {
			success: true,
			validateToken: 'invalid',
		}
	}
	try {
		const userAuth = dbAuth.getUsersByResetToken(token);
		if (userAuth.length == 0) {
			return {
				success: true,
				validateToken: 'invalid',
			};
		}
		if (userAuth.length > 1)
			throw new HttpError(500, "Database failed");
		if (new Date(userAuth[0].reset_token_expiry) < new Date()) {
			return {
				success: true,
				validateToken: 'expired',
			};
		}
		return {
			success: true,
			validateToken: 'valid',
		};
	}
	catch (error) {
		throw error;
	}
}

function validateFormat(password: string, confirmPassword: string): AuthResponse {
	const allErrors: AuthErrors = {};

	const checkFormat = UpdatePasswordSchema.safeParse({ password, confirmPassword });
	if (!checkFormat.success) {
		checkFormat.error.issues.forEach(error => {
			const field = error.path[0] as keyof AuthErrors;
			if (!allErrors[field]) {
				allErrors[field] = [];
			}
			allErrors[field]!.push(error.message);
		});
	}
	if (Object.keys(allErrors).length > 0)
		return createErrorResponse("Data problem", allErrors);
	return { 
		success: true,
		message: "Format OK"
	};
}

export async function resetPassword(token: string, password: string, confirmPassword: string): Promise<AuthResponse> {

	if (!token?.trim())
		return createErrorResponse("Fatal error: empty token", {});
	const validatedInput = validateFormat(password, confirmPassword);
	if (!validatedInput.success)
		return validatedInput;

	try {
		const userAuth = dbAuth.getUsersByResetToken(token);
		if (userAuth.length == 0)
			return createErrorResponse("Invalid token", {});
		if (userAuth.length > 1)
			throw new HttpError(500, "Database failed");
		if (new Date(userAuth[0].reset_token_expiry) < new Date()) {
			return {
				success: false,
				message: "Expired token",
				expired_token: true,
			}
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		try {
			const db = getDatabase();
			const transaction = db.transaction(() => {
				dbUsers.updatePassword(hashedPassword, userAuth[0].user_id);
				dbAuth.updateResetToken(userAuth[0].user_id);
			});
			transaction();
		}
		catch (dbError) {
			throw new HttpError(500, "Failed to update password");
		}

		return { 
			success: true,
			message: "Password reset successfully"
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function twoFAStatus(user_id: string): Promise<AuthResponse> {
	try {
		const userAuthRow = dbAuth.getUserAuthentificationRow(user_id);
		if (!userAuthRow)
			throw new HttpError(500, "Checking two factor authentification service error");
		return {
			success: true,
			message: "Check 2FA success",
			user: {
				totp_required: Boolean(userAuthRow.is_totp_enabled),
			}
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function twoFAChange(user_id: string, status: boolean): Promise<AuthResponse> {
	try {
		const userAuthRow = dbAuth.getUserAuthentificationRow(user_id);
		if (!userAuthRow)
			throw new HttpError(500, "Checking two factor authentification service error");
		if (status) {
			const { totp_secret, uri } = generateTotpSecret();
			console.log(totp_secret)
			console.log(uri)
			dbAuth.update2FAByUserId(status, totp_secret, user_id);
			return {
				success: true,
				message: "2FA enabled successfully",
				totp_token: totp_secret
			}
		}
		else
			dbAuth.update2FAByUserId(status, null, user_id);
		return {
			success: true,
			message: "2FA disabled successfully",
		}
	}
	catch (error) {
		throw error;
	}
}

export async function twoFAVerify(fastify: FastifyInstance, code: string, pre_auth: string): Promise<AuthResponse> {
	try {
		if (!pre_auth)
			throw new HttpError(400, 'Missing token');
		if (!code) {
			return {
				success: false,
				message: "Wrong code"
			}
		}
		const decoded = await fastify.jwt.verify(pre_auth) as { userId: string };
		const userId = decoded.userId;
		const authRow = dbAuth.getUserAuthentificationRow(userId);
		if (!authRow)
			throw new HttpError(500, "Checking two factor authentification service error");

		const isValid = verifyTotpCode(authRow.totp_secret, code);
		if (!isValid) {
			return {
				success: false,
				message: "Wrong code"
			}
		}

		return {
			success: true,
			message: "Login successful",
			user: {
				user_id: userId
			}
		}
	}
	catch (error) {
		if (error.code === 'FAST_JWT_EXPIRED') {
			return {
				success: false,
				message: "Token expired. Please re-connect.",
			};
		}
		if (error.code === 'FAST_JWT_MALFORMED') {
			return {
				success: false,
				message: "Please re-connect."
			};
		}
			// throw new HttpError(400, "Invalid token");
		throw error;
	}
}


// UTILS 
function generateTotpSecret() {
	const newSecret = twofactor.generateSecret({ name: 'Transcendance', account: 'johndoe' });
	return {
		totp_secret: newSecret.secret,
		uri: newSecret.uri,
	};
}

function verifyTotpCode(secret: string, code: string) {
	console.log(`\n--- TOTP Verification Debug ---`);
	console.log(`Secret: ${secret}`);
	console.log(`Expected: ${twofactor.generateToken(secret).token} | Received: ${code}`);

	const result = twofactor.verifyToken(secret, code);
	if (!result)
		return false;
	
	console.log(`Delta: ${result.delta}`);

	return result.delta >= -2 && result.delta <= 2;
}


const authService = {
	signUpUser,
	loginUser,
	logoutUser,
	forgotPassword,
	checkResetToken,
	resetPassword,
	twoFAStatus,
	twoFAChange,
	twoFAVerify
};

export default authService;
