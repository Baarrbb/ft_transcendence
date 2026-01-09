import { apiService } from './api.ts'
import type { BasicResponse, UsersListResponse } from '@shared/types/users.ts'

export class BlockUsersService {

	async blockUser(username: string): Promise<BasicResponse> {
		return await apiService.post<BasicResponse>('/blockUsers/block', username);
	}

	async getBlockedUsers(): Promise<UsersListResponse> {
		return await apiService.get<UsersListResponse>('/blockUsers');
	}

	async unblockUser(username: string): Promise<BasicResponse> {
		return await apiService.post<BasicResponse>('/blockUsers/unblock', username);
	}

}

export const blockUsersService = new BlockUsersService();
