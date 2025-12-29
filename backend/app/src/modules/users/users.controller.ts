
import { FastifyRequest, FastifyReply } from 'fastify'
import type { UserResponse, UsersListResponse, UpdatePasswordData, BasicResponse } from '@shared/types/users.ts';
import usersService from './users.service.ts';
import { handleControllerError } from '../../utils/controllerUtils.ts'
import { config } from '../../config.ts'

export class UserController {

	userInfoHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<UserResponse> => {
		try {
			if (request.auth === 'PRE_2FA') {
				return {
					success: false,
					code: '2FA_REQUIRED',
					message: 'Two-factor authentication required'
				};
			}
			if (request.auth === 'LINK_TOKEN') {
				return {
					success: false,
					code: 'LINK_ACCOUNT',
					message: ''
				};
			}
			return reply.send({
				success: true,
				message: "User info",
				user: {
					username: request.localUser.username,
					email: request.localUser.email,
					avatar: request.localUser.link_avatar,
					isPasswd: request.localUser.isPasswd,
					google: request.localUser.google_id ? true : false,
				}
			});
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	userUpdateUsernameHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<UserResponse> => {
		try {
			const newUsername = request.body;
			const updatedUsername = await usersService.updateUsername(newUsername, request.localUser.user_id);
			return reply.send(updatedUsername);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	userUpdateAvatarHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<UserResponse> => {
		try {
			const data = await request.file();
			const updatedAvatar = await usersService.updateAvatar(data, request.localUser);
			return reply.send(updatedAvatar);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	userUpdateEmailHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<UserResponse> => {
		try {
			const newEmail = request.body;
			const updatedEmail = await usersService.updateEmail(newEmail, request.localUser.user_id);
			return reply.send(updatedEmail);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	userUpdatePasswordHandler = async (request: FastifyRequest<{ Body: UpdatePasswordData }>, reply: FastifyReply): Promise<UserResponse> => {
		try {
			const { actualPassword, newPassword } = request.body;
			const updatedPassword = await usersService.updatePassword(actualPassword, newPassword, request.localUser.user_id);
			return reply.send(updatedPassword);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	userAddPassword = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<UserResponse> => {
		try {
			const newPasswd = request.body;
			const userId = request.localUser.user_id;
			const addPasswd = await usersService.addPassword(newPasswd, userId);
			// console.log(addPasswd)
			return reply.send(addPasswd);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}


	usersLeaderboardListHandler = async (request: FastifyRequest<{ Querystring: { sort?: string; limit?: string } }>, reply: FastifyReply): Promise<UsersListResponse> => {
		try {
			const { sort, limit } = request.query;
			const usersList = await usersService.getLeaderboardUsers(sort, limit, request.localUser.user_id);
			return reply.send(usersList);

		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	usersNonFriendHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<UsersListResponse> => {
		try {
			const usersList = await usersService.getUsersNonFriend(request.localUser.user_id);
			return reply.send(usersList);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	onlineUsersHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<UsersListResponse> => {
		try {
			const user_id = request.localUser.user_id;
			const usersOnline = await usersService.getOnlineUsers(user_id);
			return reply.send(usersOnline);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	usersInvitationHandler = async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const user_id = request.localUser.user_id;
			const invitations = await usersService.getInvitations(user_id);
			return reply.send(invitations);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}



	userAnonymizeDataHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const sessionToken = request.cookies?.sessionToken;
			const user_id = request.localUser.user_id;
			const anon = await usersService.anonymizeData(user_id, sessionToken);
			return reply.send(anon);
		}
		catch (error) {
			// console.log(error);
			return handleControllerError(reply, error);
		}
	}

	userDeleteDataHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<BasicResponse> => {
		try {
			const sessionToken = request.cookies?.sessionToken;
			const user_id = request.localUser.user_id;
			const anon = await usersService.deleteData(user_id, sessionToken);
			reply.clearCookie('sessionToken', {
				path: '/',
				httpOnly: true,
				secure: config.nodeEnv === 'production',
				sameSite: 'strict',
			});
			reply.clearCookie('refreshTokenId', {
				path: '/',
				httpOnly: true,
				secure: config.nodeEnv === 'production',
				sameSite: 'strict',
			});
			return reply.send(anon);
		}
		catch (error) {
			// console.log(error);
			return handleControllerError(reply, error);
		}
	}

	userRequestDataHandler = async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const user_id = request.localUser.user_id;
			const data = await usersService.requestData(user_id);
			return reply.send(data);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

}

export const userController = new UserController();
