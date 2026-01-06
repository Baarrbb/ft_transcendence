import { FastifyRequest, FastifyReply } from 'fastify'
import { handleControllerError } from '../../utils/controllerUtils.ts'
import type { BasicResponse } from '@shared/types/users.ts';
import matchService from './match.service.ts';


export class MatchController {

	getStatusInvitationsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const user_id = request.localUser.user_id;
			const invitationsStatus = await matchService.getStatusInvitations(user_id);

			return reply.send(invitationsStatus);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	getStatusInvitationUserHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply) => {
		try {
			const user_id = request.localUser.user_id;
			const username = request.body;
			const invitationStatus = await matchService.getStatusInvitationUser(user_id, username);

			return reply.send(invitationStatus);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	addInvitationHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const user_id = request.localUser.user_id;
			const username = request.body;
			const addInvite = await matchService.addInvitation(user_id, username);

			return reply.send(addInvite);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	cancelInvitationHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const user_id = request.localUser.user_id;
			const username = request.body;
			const removeInvite = await matchService.cancelInvitation(user_id, username);

			return reply.send(removeInvite);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	declineInvitationHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const user_id = request.localUser.user_id;
			const username = request.body;
			const removeInvite = await matchService.declineInvitation(user_id, username);

			return reply.send(removeInvite);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	acceptInvitationHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply) => {
		try {
			const user_id = request.localUser.user_id;
			const myUsername = request.localUser.username;
			const username = request.body;
			const removeInvite = await matchService.acceptInvitation(myUsername, user_id, username);

			return reply.send(removeInvite);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	getMatchIdHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply) => {
		try {
			const user_id = request.localUser.user_id;
			const myUsername = request.localUser.username;
			const username = request.body;

			const matchId = await matchService.getMatchId(user_id, myUsername, username);
			// const removeInvite = await matchService.acceptInvitation(user_id, username);

			return reply.send(matchId);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	getMatchHistoryHandler = async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const user_id = request.localUser.user_id;
			const history = await matchService.getMatchHistory(user_id);

			return reply.send(history);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	getMatchHistoryUserHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply) => {
		try {
			const username = request.body;
			const history = await matchService.getMatchHistoryUser(username);

			return reply.send(history);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	getMatchEvolutionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const user_id = request.localUser.user_id;
			const evolution = await matchService.getMatchEvolution(user_id);

			return reply.send(evolution);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	getMatchEvolutionUserHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply) => {
		try {
			const username = request.body;
			const evolution = await matchService.getMatchEvolutionUser(username);

			return reply.send(evolution);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

}

export const matchController = new MatchController();
