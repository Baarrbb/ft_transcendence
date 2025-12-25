
import { FastifyInstance } from 'fastify'
import { authController } from './auth.controller.ts';
import { authenticate } from '../../middleware/authMiddleware.ts'
import { googleAuthController } from './oauth/google.controller.ts'

export default async function (fastify: FastifyInstance, opts: any) {
	fastify.post('/auth/signup', authController.signUpHandler);
	fastify.post('/auth/login', authController.loginHandler);
	fastify.get('/auth/logout', { preHandler: [authenticate] }, authController.logoutHandler);

	// Forgot password
	fastify.post('/auth/forgot-password', authController.forgotPasswordHandler);
	fastify.post('/auth/validate-token', authController.validateResetToken);
	fastify.post('/auth/reset-password', authController.resetPasswordHandler);

	// 2FA
	fastify.get('/auth/2fa-status', { preHandler: [authenticate] }, authController.twoFAStatusHandler);
	fastify.post('/auth/2fa-change', { preHandler: [authenticate] }, authController.twoFAChangeHandler);
	fastify.post('/auth/2fa-verify', authController.twoFAVerifyHandler);

	// Google
	fastify.get('/auth/google', googleAuthController.loginGoogleHandler);
	fastify.get('/auth/google/callback', googleAuthController.googleCallbackHandler);
	fastify.post('/auth/google/link-account', googleAuthController.linkGoogleHandler);
	fastify.get('/auth/google/unlink', { preHandler: [authenticate] }, googleAuthController.unlinkGoogleHandler);
}
