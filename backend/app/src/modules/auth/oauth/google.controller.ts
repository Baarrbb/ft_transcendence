
import type { AuthResponse } from '@shared/types/auth.ts'
import type { BasicResponse } from '@shared/types/users.ts'
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { config } from '../../../config.ts'
import googleAuthService from './google.service.ts'
import { handleControllerError } from '../../../utils/controllerUtils.ts'
import { setAuthCookies } from '../../../utils/misc.ts'
import sessionUtils from '../../../utils/sessionHandling.ts';

export class GoogleAuthController {

	loginGoogleHandler = async (request: FastifyRequest, reply: FastifyReply) => {
		const params = new URLSearchParams();
		params.set('client_id', config.clientID);
		params.set('redirect_uri', config.redirectURL);
		params.set('response_type', 'code');
		params.set('scope', 'openid email profile');
		params.set('access_type', 'offline');
		params.set('prompt', 'consent');

		const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
		// console.log(googleAuthURL)
		reply.redirect(googleAuthURL);
	}

	oauthRedirectError = (reply: FastifyReply, redirect: string) => {
		reply.setCookie('oauth_error', 'already_linked', {
			httpOnly: false,
			secure: config.nodeEnv === 'production',
			path: '/',
			sameSite: 'lax',
			maxAge: 10
		});
		return reply.redirect(`${config.frontendHost}${redirect}`)
	}

	oauthMiddleParam = (reply: FastifyReply, redirect: string, name: string, jwt: any) => {
		reply.setCookie(name, jwt, {
			httpOnly: true,
			secure: config.nodeEnv === 'production',
			path: '/',
			sameSite: 'lax',
			maxAge: 10 * 60
		})
		return reply.redirect(`${config.frontendHost}${redirect}`);
	}

	googleCallbackHandler = async (request: FastifyRequest<{ Querystring: { code?: string; } }>, reply: FastifyReply) => {
		try {
			const { code } = request.query;

			const sessionToken = request.cookies.sessionToken;
			if (sessionToken) {
				const userId = await sessionUtils.validateSessionToken(sessionToken);
				const alreadyAuthUser = await googleAuthService.authLinkGoogle(userId, code);
				if (alreadyAuthUser.success)
					return reply.redirect(`${config.frontendHost}/main/parameters`);
				else
					return this.oauthRedirectError(reply, '/main/parameters');
			}

			const authGoogle: AuthResponse = await googleAuthService.googleCallback(reply.server as FastifyInstance, code);
			if (authGoogle.success && authGoogle.user?.user_id) {
				await setAuthCookies(reply, authGoogle.user.user_id, 0);
				return reply.redirect(`${config.frontendHost}/main/home`);
			}
			if (!authGoogle.success && authGoogle.user?.totp_required)
				return this.oauthMiddleParam(reply, '/double-authentification', 'pre_auth', authGoogle.has2fa);
			if (!authGoogle.success && authGoogle.link_token)
				return this.oauthMiddleParam(reply, '/link-account', 'linkToken', authGoogle.link_token);
			if (!authGoogle.success && authGoogle.linked)
				return this.oauthRedirectError(reply, '/login');
			return reply.redirect(`${config.frontendHost}/login`);
		}
		catch (error) {
			return reply.redirect(`${config.frontendHost}/login`);
		}
	}

	linkGoogleHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<AuthResponse> => {
		try {
			const passwd = request.body;
			const token = request.cookies.linkToken;
			const linkGoogle = await googleAuthService.linkGoogle(reply.server as FastifyInstance, passwd, token);

			if (linkGoogle.success || (!linkGoogle.success && linkGoogle.user?.totp_required)) {
				reply.clearCookie('linkToken', {
					path: '/',
					httpOnly: true,
					secure: config.nodeEnv === 'production',
					sameSite: 'lax',
				});
			}
			if (!linkGoogle.success && linkGoogle.user?.totp_required) {
				reply.setCookie('pre_auth', linkGoogle.has2fa, {
					httpOnly: true,
					secure: config.nodeEnv === 'production',
					path: '/',
					sameSite: 'lax',
					maxAge: 10 * 60
				})
			}

			if (linkGoogle.success && !linkGoogle.user?.totp_required)
				await setAuthCookies(reply, linkGoogle.user.user_id, 0);

			return reply.send(linkGoogle);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	unlinkGoogleHandler = async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const userId = request.localUser.user_id;
			const unlinkGoogle: BasicResponse = googleAuthService.unlinkGoogle(userId);
			return unlinkGoogle;
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

}

export const googleAuthController = new GoogleAuthController();

// check si mail deja utilise et que count utilise 2fa a quel moment ca demande de lie 
