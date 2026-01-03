import { FastifyInstance } from 'fastify'
import { friendController } from './friends.controller.ts';
import { authenticate } from '../../middleware/authMiddleware.ts'

export default async function (fastify: FastifyInstance, opts: any) {

	fastify.addHook('preHandler', authenticate);

	fastify.post('/friends/add', friendController.addFriendHandler);

	fastify.post('/friends/accept', friendController.acceptFriendHandler);
	fastify.post('/friends/decline', friendController.declineFriendHandler);
	fastify.post('/friends/remove', friendController.removeFriendHandler);

	fastify.get('/friends', friendController.usersFriendsHandler);
	fastify.get('/friends/online', friendController.onlineFriendsHandler);

}
