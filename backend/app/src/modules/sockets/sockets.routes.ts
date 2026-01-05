
import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authMiddleware.ts'
import { socketController } from './sockets.controller.ts';

export default async function (fastify: FastifyInstance) {

	fastify.addHook('preHandler', authenticate);

	fastify.get('/ws/online', { websocket: true }, async (socket, req) => {
		await socketController.userSocketHandler(socket, req);
	});

	// fastify.get('/ws/match', { websocket: true }, async (socket, req) => {
	// 	await socketController.matchSocketHandler(socket, req);
	// })

	fastify.get('/ws/match/:matchId', { websocket: true }, async (socket, req) => {
		const matchId = (req.params as { matchId: string }).matchId;
		await socketController.gameSocketHandler(socket, req, matchId);
	})

}
