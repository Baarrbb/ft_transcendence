
import { FastifyRequest, FastifyReply } from 'fastify'
import { handleControllerError } from '../../utils/controllerUtils.ts'
import type { ChannelInfo, ChatHistory } from '@shared/types/chat.ts';
import chatService from './chat.service.ts';


export class ChatController {
	channelInfoHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<ChannelInfo> => {
		try {
			const usernameChat = request.body;
			const user_id = request.localUser.user_id
			const channelInfo = chatService.getChannelInfo(user_id, usernameChat);
			// console.log(channelInfo);
			return reply.send(channelInfo);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}

	chatHistoryHandler = async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply): Promise<ChatHistory> => {
		try {
			const channelId = request.body;
			const myUserId = request.localUser.user_id;
			const history = chatService.getChatHistory(myUserId, channelId);
			return reply.send(history);
		}
		catch (error) {
			return handleControllerError(reply, error);
		}
	}
}


export const chatController = new ChatController();
