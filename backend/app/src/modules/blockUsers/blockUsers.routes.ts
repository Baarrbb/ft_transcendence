import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authMiddleware.ts'
import { blockUsersController } from './blockUsers.controller.ts';

export default async function (fastify: FastifyInstance, opts: any) {

	// fastify.addHook('preValidation', authenticate);
	fastify.addHook('preHandler', authenticate);

	fastify.get('/blockUsers', blockUsersController.blockedUsersHandler);
	fastify.post('/blockUsers/block', blockUsersController.blockUserHandler);
	fastify.post('/blockUsers/unblock', blockUsersController.unblockUserHandler);

}
