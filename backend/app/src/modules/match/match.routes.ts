import { FastifyInstance } from 'fastify'
import { matchController } from './match.controller.ts';
import { authenticate } from '../../middleware/authMiddleware.ts'

export default async function (fastify: FastifyInstance, opts: any) {

	fastify.addHook('preHandler', authenticate);

	// fastify.get('/match/invitations/pending', matchController.getSentInvitationsHandler);
	// fastify.get('/match/invitations/waiting', matchController.getReceivedInvitationsHandler);
	// fastify.get('/match/invitations/accepted', matchController.getAcceptedInvitationsHandler);

	fastify.get('/match/invitations/status', matchController.getStatusInvitationsHandler);
	fastify.post('/match/invitations/status', matchController.getStatusInvitationUserHandler);

	fastify.post('/match/invitations/add', matchController.addInvitationHandler);
	fastify.post('/match/invitations/cancel', matchController.cancelInvitationHandler);
	fastify.post('/match/invitations/decline', matchController.declineInvitationHandler);
	fastify.post('/match/invitations/accept', matchController.acceptInvitationHandler);
	fastify.post('/match/invitations/matchId', matchController.getMatchIdHandler);

	fastify.get('/match/history', matchController.getMatchHistoryHandler);
	fastify.post('/match/history', matchController.getMatchHistoryUserHandler);
	fastify.get('/match/evolution', matchController.getMatchEvolutionHandler);
	fastify.post('/match/evolution', matchController.getMatchEvolutionUserHandler);

}
