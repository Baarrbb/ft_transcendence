
import { FastifyReply } from 'fastify'
import { generateAccessToken, generateRefreshToken } from './jwtUtils.ts'
import sessionUtils from './sessionHandling.ts';
import { config } from '../config.ts';

export async function setAuthCookies(reply: FastifyReply, userId: string, googleAuth: number) {
	try {
		// const accessToken = await generateAccessToken(userId);
		const refreshTokenId = await generateRefreshToken(userId);
		const sessionToken = await sessionUtils.generateSessionToken();
		sessionUtils.storeSessionToken(userId, sessionToken);
		let samesite: 'strict' | 'lax' | 'none' = 'strict';
		if (googleAuth === 1)
			samesite = 'lax';

		reply.setCookie('sessionToken', sessionToken, {
			httpOnly: true,
			secure: config.nodeEnv === 'production',
			path: '/',
			// sameSite: samesite,
			// besoin de lax pour quand on veut link Google depuis une session deja co 
			// j'ai besoin de voir le cokkie sessionToken depuis le callback de Google
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 // 7 jours, optionnel
		});
		reply.setCookie('refreshTokenId', refreshTokenId, {
			httpOnly: true,
			secure: config.nodeEnv === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			path: '/',
			sameSite: samesite,
		});
		// reply.setCookie('accessToken', accessToken, {
		// 	httpOnly: true,
		// 	secure: config.nodeEnv === 'production',
		// 	maxAge: 15 * 60 * 1000, // 15 minutes
		// 	path: '/',
		// 	sameSite: samesite,
		// });
	} catch (error) {
		console.error('Error setting authentication cookies:', error);
		throw new Error('Failed to set authentication cookies');
	}
}
