import { FastifyRequest, FastifyReply } from 'fastify'
import { handleControllerError } from '../../utils/controllerUtils.ts'
import type { BasicResponse, UsersListResponse } from '@shared/types/users.ts';
import friendService from './friends.service.ts';


export class FriendController {

	addFriendHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const usernameToAdd = request.body;
			const user_id = request.localUser.user_id;
			const userAdd = await friendService.addFriend(usernameToAdd, user_id);

			return reply.send(userAdd);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	acceptFriendHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const fromUsername = request.body;
			const user_id = request.localUser.user_id;
			const userAccepted = await friendService.acceptFriend(fromUsername, user_id);

			return reply.send(userAccepted);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	declineFriendHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const fromUsername = request.body;
			const user_id = request.localUser.user_id;
			const userDeclined = await friendService.declineFriend(fromUsername, user_id);

			return reply.send(userDeclined);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	usersFriendsHandler = async (request: FastifyRequest<{ Querystring: { sort?: string; limit?: string } }>, reply: FastifyReply): Promise<UsersListResponse> => {
		try {
			const { sort, limit } = request.query;
			const user_id = request.localUser.user_id;

			const friendsList = await friendService.getFriendsList(sort, limit, user_id);
			return reply.send(friendsList);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	removeFriendHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const username = request.body;
			const user_id = request.localUser.user_id;

			const removedFriend = await friendService.removeFriend(username, user_id);
			return reply.send(removedFriend);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	onlineFriendsHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<UsersListResponse> => {
		try {
			const user_id = request.localUser.user_id;
			const onlineFriends = await friendService.getOnlineFriends(user_id);
			return reply.send(onlineFriends);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

}

export const friendController = new FriendController();
