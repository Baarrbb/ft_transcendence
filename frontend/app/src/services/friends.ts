import { apiService } from './api.ts'
import type { BasicResponse, UsersListResponse } from '@shared/types/users.ts'

export class FriendsService {

	async addFriend(username: string): Promise<BasicResponse> {
		return await apiService.post<BasicResponse>('/friends/add', username);
	}

	async acceptFriend(username: string): Promise<BasicResponse> {
		return await apiService.post<BasicResponse>('/friends/accept', username);
	}

	async declineFriend(username: string): Promise<BasicResponse> {
		return await apiService.post<BasicResponse>('/friends/decline', username);
	}

	async getFriends(sortBy: string, limit: string): Promise<UsersListResponse> {
		return await apiService.get<UsersListResponse>(`/friends?sort=${sortBy}&limit=${limit}`);
	}

	async removeFriend(username: string): Promise<BasicResponse> {
		return await apiService.post<BasicResponse>(`/friends/remove`, username);
	}

	async getOnlineFriends(): Promise<UsersListResponse> {
		return await apiService.get<UsersListResponse>('/friends/online');
	}

}



export const friendsService = new FriendsService();