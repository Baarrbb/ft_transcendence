
import type { AuthResponse } from '@shared/types/auth.ts'
import type { BasicResponse } from '@shared/types/users.ts'
import type { FastifyInstance } from 'fastify';
import { config } from '../../../config.ts'
import HttpError from '../../../utils/httpError.ts';
import axios from 'axios';
import dbUsers from '../../users/users.model.ts';
import dbAuth from '../auth.model.ts';
import { randomUUID } from 'crypto';
import { getDatabase } from '../../../db.ts';
import bcrypt from 'bcrypt';
import path from 'path';
import sharp from 'sharp';
import { generateUsername } from 'unique-username-generator';

async function downloadAvatar(url: string, id: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok)
		throw new Error(`Failed to fetch avatar (${res.status})`);
	const contentType = res.headers.get('content-type');
	if (!contentType || !contentType.startsWith('image'))
		throw new Error(`Not an image`);

	const buffer = Buffer.from(await res.arrayBuffer());
	if (buffer.length > 5 * 1024 * 1024) // sup 5Mb
		throw new Error('Avatar too large');

	const filename = `avatar_${id}_${Date.now()}.webp`;
	const filePath = path.join('/app/uploads', filename);

	await sharp(buffer)
		.resize(256, 256)
		.webp({ quality: 80 })
		.toFile(filePath);
	return filename;
}

function getUserAuth(fastify: FastifyInstance, userRow: any): AuthResponse {
	const userAuthRow = dbAuth.getUserAuthentificationRow(userRow.user_id);
	if (!userAuthRow)
		throw new HttpError(500, "Authentification service error");
	if (userAuthRow.is_totp_enabled) {
		const has2fa = fastify.jwt.sign(
			{ userId: userRow.user_id, },
			{ expiresIn: '5min' }
		);
		return {
			success: false,
			message: "TOTP verification required",
			user: {
				user_id: userRow.user_id,
				totp_required: true
			},
			has2fa
		};
	}
	return {
		success: true,
		message: "User login successfuly",
		user: { user_id: userRow.user_id }
	};
}

async function getGoogleUserInfo(code: string) {
	if (!code)
		throw new HttpError(500, "Google callback error");
	const params = new URLSearchParams();
	params.set('code', code);
	params.set('client_id', config.clientID);
	params.set('client_secret', config.clientSecret);
	params.set('redirect_uri', config.redirectURL);
	params.set('grant_type', 'authorization_code');

	const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(),
		{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

	const { access_token } = tokenRes.data;

	const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo',
		{ headers: { Authorization: `Bearer ${access_token}` } });

	const userInfo = userRes.data;
	if (!userInfo)
		throw new HttpError(500, "Google callback error: user info failed");
	return userInfo;
}

export async function googleCallback(fastify: FastifyInstance, code: string): Promise<AuthResponse> {
	try {
		const userInfo = await getGoogleUserInfo(code);
		// console.log(userInfo);

		const userGoogleId = dbUsers.getUserByGoogleId(userInfo.id);
		if (userGoogleId)
			return getUserAuth(fastify, userGoogleId);

		const emailAlreadyUsed = dbUsers.getUsersByEmail(userInfo.email);
		if (emailAlreadyUsed.length > 0) {
			if (emailAlreadyUsed[0].google_id === userInfo.id)
				return getUserAuth(fastify, emailAlreadyUsed[0]);
			else if (emailAlreadyUsed[0].google_id) {
				return {
					success: false,
					message: "EMAIL_ALREADY_LINK_TO_OTHER_GOOGLE.",
					linked: true,
				}
			}
			else {
				const linkToken = fastify.jwt.sign({ 
					userId: emailAlreadyUsed[0].user_id,
					googleId: userInfo.id
				},
				{ expiresIn: '10m' });
				return {
					success: false,
					message: "ACCOUNT_ALREADY_EXIST_WITH_THIS_EMAIL",
					link_token: linkToken
				};
			}
		}
		else {
			let userUsername = dbUsers.getUserByUsername(userInfo.given_name)
			const userId = randomUUID();
			let user;
			const db = getDatabase();
			if (userUsername || !userInfo.given_name) {
				let limit = 0;
				let genUsername: string = generateUsername();
				while (userUsername && limit++ < 5) {
					genUsername = generateUsername();
					userUsername = dbUsers.getUserByUsername(genUsername)
				}
				const transaction = db.transaction(() => {
					user = dbUsers.createUserFromGoogle(userInfo.id, genUsername, userInfo.email, 'avatar.jpg', userId);
					dbAuth.createUserAuthentification(userId);
				});
				transaction();
			}
			else {
				const transaction = db.transaction(() => {
					user = dbUsers.createUserFromGoogle(userInfo.id, userInfo.given_name, userInfo.email, 'avatar.jpg', userId);
					dbAuth.createUserAuthentification(userId);
				});
				transaction();
			}

			try {
				const avatar = await downloadAvatar(userInfo.picture, user.id);
				dbUsers.updateAvatar(avatar, user.user_id);
			}
			catch (error) {}

			return {
				success: true,
				message: "USER_CREATED_SUCCESSFULY",
				user: { user_id: userId }
			};
		}
	}
	catch (error) {
		throw error;
	}
}

export async function linkGoogle(fastify: FastifyInstance, passwd: string, token: string): Promise<AuthResponse> {
	try {
		if (!token)
			throw new HttpError(400, 'Missing link token');

		const decoded = await fastify.jwt.verify(token) as { userId: string, googleId: string };
		const userId = decoded.userId;
		const googleId = decoded.googleId;
		const existingUser = dbUsers.getUserByUserId(userId);
		if (!existingUser) {
			return {
				success: false,
				message: 'Invalid password'
			}
		}
		if (!existingUser.password) {
			return {
				success: false,
				message: 'This account is already link to Google'
			}
		}

		const isPasswordValid = await bcrypt.compare(passwd, existingUser.password);
		if (!isPasswordValid) {
			return {
				success: false,
				message: 'Invalid password'
			}
		}

		dbUsers.linkGoogleId(userId, googleId);

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

		return {
			success: true,
			message: "User login successfuly",
			user: { user_id: existingUser.user_id }
		};
	}
	catch (error) {
		if (error.code === 'FAST_JWT_EXPIRED') {
			return {
				success: false,
				message: "Token expired. Please re-connect with Google.",
			};
		}
		if (error.code === 'FAST_JWT_MALFORMED') {
			return {
				success: false,
				message: "Please re-connect with Google."
			};
		}
			// throw new HttpError(400, "Invalid token");

		throw error;
	}
}

export function unlinkGoogle(userId: string): BasicResponse {
	try {
		const user = dbUsers.getUserByUserId(userId);
		if (user.google_id) {
			dbUsers.unlinkGoogleId(userId);
			return {
				success: true,
				message: 'Account unlink successfuly'
			}
		}
		return {
			success: false,
			message: 'Internal server error'
		}
	}
	catch (error) {
		throw error;
	}
}

export async function authLinkGoogle(userId: string, code: string): Promise<BasicResponse> {
	try {
		const userInfo = await getGoogleUserInfo(code);

		const userGoogle = dbUsers.getUserByGoogleId(userInfo.id);
		if (userGoogle) {
			return {
				success: false,
				message: "Account Google already exist"
			}
		}
		dbUsers.linkGoogleId(userId, userInfo.id);
		return {
			success: true,
			message: "Account link to Google successfuly",
		}
	}
	catch (error) {
		throw error;
	}
}


const googleAuthService = {
	googleCallback,
	linkGoogle,
	unlinkGoogle,
	authLinkGoogle
};

export default googleAuthService;