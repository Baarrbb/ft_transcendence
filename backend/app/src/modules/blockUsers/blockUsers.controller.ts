
import { FastifyRequest, FastifyReply } from 'fastify';
import type { BasicResponse, UsersListResponse } from '@shared/types/users.ts';
import { handleControllerError } from '../../utils/controllerUtils.ts'
import { blockUser, blockedUsers, unblockUser } from './blockUsers.service.ts'

export class BlockUsersController {

	blockUserHandler = async (request: FastifyRequest<{ Body: string}>, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const userToBlock = request.body;
			const user_id = request.localUser.user_id;
			const isBlocked = await blockUser(userToBlock, user_id);
			return reply.send(isBlocked);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	blockedUsersHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<UsersListResponse> => {
		try {
			const user_id = request.localUser.user_id;
			const blockedList = await blockedUsers(user_id);
			return reply.send(blockedList);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	unblockUserHandler = async (request: FastifyRequest<{ Body: string}>, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const userToUnblock = request.body;
			const user_id = request.localUser.user_id;
			const isUnblocked = await unblockUser(userToUnblock, user_id);
			return reply.send(isUnblocked);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

}

export const blockUsersController = new BlockUsersController();
