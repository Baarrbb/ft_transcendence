
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import type { RegisterData, LoginData, AuthResponse, ValidateToken, ResetPasswordData } from '@shared/types/auth.ts'
import authService from './auth.service.ts'
import { setAuthCookies } from '../../utils/misc.ts'
import { config } from '../../config.ts'
import { handleControllerError } from '../../utils/controllerUtils.ts'

export class AuthController {

	signUpHandler = async (request: FastifyRequest<{ Body: RegisterData}>, reply: FastifyReply): Promise<AuthResponse> => {
		try {
			const { email, username, password } = request.body;
			const registerUser = await authService.signUpUser(email, username, password);
			if (registerUser.success && registerUser.user?.user_id)
				await setAuthCookies(reply, registerUser.user.user_id, 0);
			return reply.send(registerUser);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	loginHandler = async (request: FastifyRequest<{ Body: LoginData}>, reply: FastifyReply): Promise<AuthResponse> => {
		try {
			// const { username, password, remember } = request.body;
			const { username, password } = request.body;
			// const signinUser = await authService.loginUser(reply.server as FastifyInstance, username, password, remember);
			const signinUser = await authService.loginUser(reply.server as FastifyInstance, username, password);
			if (signinUser.success && !signinUser.user?.totp_required)
				await setAuthCookies(reply, signinUser.user.user_id, 0);
			if (!signinUser.success && signinUser.user?.totp_required) {
				reply.setCookie('pre_auth', signinUser.has2fa, {
					httpOnly: true,
					secure: config.nodeEnv === 'production',
					path: '/',
					sameSite: 'lax',
					maxAge: 10 * 60
				})
			}
			// else if (signinUser.user?.totp_required) {
			// 	const pendingSessionToken = randomBytes(64).toString('hex');
			// 	reply.setCookie('sessionToken', pendingSessionToken, {
			// 		httpOnly: true,
			// 		secure: process.env.NODE_ENV === 'production', // true en prod
			// 		sameSite: 'strict',
			// 	});
			// }
			return reply.send(signinUser);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	logoutHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<AuthResponse> => {
		try {
			request.auth = 'NONE';
			const sessionToken = request.cookies?.sessionToken;
			const userId = request.localUser.user_id;
			const tokenId = request.cookies.refreshTokenId;
			const userLogout = await authService.logoutUser(sessionToken, userId, tokenId);
			if (userLogout.success) {
				reply.clearCookie('sessionToken', {
					path: '/',
					httpOnly: true,
					secure: config.nodeEnv === 'production',
					sameSite: 'strict',
				});
				reply.clearCookie('refreshTokenId', {
					path: '/',
					httpOnly: true,
					secure: config.nodeEnv === 'production',
					sameSite: 'strict',
				});
			}
			return reply.send(userLogout);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	forgotPasswordHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<AuthResponse> => {
		try {
			const email = request.body;
			const userForgot = await authService.forgotPassword(email);
			return reply.send(userForgot);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	validateResetToken = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<ValidateToken> => {
		try {
			const token = request.body;
			const validToken = await authService.checkResetToken(token);
			return reply.send(validToken);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	resetPasswordHandler = async (request: FastifyRequest<{ Body: ResetPasswordData }>, reply: FastifyReply): Promise<AuthResponse> => {
		try {
			const { token, password, confirmPassword } = request.body;
			const updateUserPasswd = await authService.resetPassword(token, password, confirmPassword);
			return reply.send(updateUserPasswd);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	twoFAStatusHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<AuthResponse> => {
		try {
			const user_id = request.localUser.user_id;
			const status = await authService.twoFAStatus(user_id);
			return reply.send(status);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	twoFAChangeHandler = async (request: FastifyRequest<{ Body: boolean }>, reply: FastifyReply): Promise<AuthResponse> => {
		try {
			const status = request.body;
			const user_id = request.localUser.user_id;
			const change2FA = await authService.twoFAChange(user_id, status);
			return reply.send(change2FA);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	
	}

	twoFAVerifyHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<AuthResponse> => {
		try {
			const code  = request.body;
			const pre_auth = request.cookies.pre_auth;
			const totpVerified = await authService.twoFAVerify(reply.server as FastifyInstance, code, pre_auth);
			if (totpVerified.success) {
				reply.clearCookie('pre_auth', {
					path: '/',
					httpOnly: true,
					secure: config.nodeEnv === 'production',
					sameSite: 'strict',
				});
				await setAuthCookies(reply, totpVerified.user.user_id, 0);
			}
			return reply.send(totpVerified);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}
}

export const authController = new AuthController();
