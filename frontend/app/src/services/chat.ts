
import { apiService } from './api.ts'
import type { ChannelInfo, ChatHistory } from '@shared/types/chat.ts'

export class ChatService {

	async channelInfo(username: string): Promise<ChannelInfo> {
		return await apiService.post<ChannelInfo>('/chat/channel-info', username);
	}

	async chatHistory(channelId: number): Promise<ChatHistory> {
		return await apiService.post<ChatHistory>('/chat/history', channelId);
	}

}

export const chatService = new ChatService();
