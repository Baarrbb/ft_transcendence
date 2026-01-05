import { FastifyInstance } from 'fastify'
import { chatController } from './chat.controller.ts';
import { authenticate } from '../../middleware/authMiddleware.ts'

export default async function (fastify: FastifyInstance, opts: any) {

	fastify.addHook('preHandler', authenticate);

	fastify.post('/chat/channel-info', chatController.channelInfoHandler);
	fastify.post('/chat/history', chatController.chatHistoryHandler);

}
