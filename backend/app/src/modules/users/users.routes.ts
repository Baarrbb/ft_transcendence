import { FastifyInstance } from 'fastify'
import { userController } from './users.controller.ts';
import { authenticate } from '../../middleware/authMiddleware.ts'

export default async function (fastify: FastifyInstance, opts: any) {

	// fastify.addHook('preValidation', authenticate);
	fastify.addHook('preHandler', authenticate);

	fastify.get('/users/me', userController.userInfoHandler);
	fastify.post('/users/me/update/username', userController.userUpdateUsernameHandler);
	fastify.post('/users/me/update/avatar', userController.userUpdateAvatarHandler);
	fastify.post('/users/me/update/email', userController.userUpdateEmailHandler);
	fastify.post('/users/me/update/password', userController.userUpdatePasswordHandler);
	fastify.post('/users/me/add/password', userController.userAddPassword)


	fastify.get('/users/leaderboard', userController.usersLeaderboardListHandler);
	// fastify.get('/users/friendships', userController.usersFriendshipsHandler);
	fastify.get('/users/nonFriends', userController.usersNonFriendHandler);
	fastify.get('/users/invitations', userController.usersInvitationHandler);

	fastify.get('/users/online', userController.onlineUsersHandler);

	// GDPR
	fastify.get('/users/me/anonymize', userController.userAnonymizeDataHandler);
	fastify.get('/users/me/delete', userController.userDeleteDataHandler);
	fastify.get('/users/me/data', userController.userRequestDataHandler);

}