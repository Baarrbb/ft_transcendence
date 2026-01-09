import { apiService } from './api.ts'
import type { UserResponse, UsersListResponse, UpdatePasswordData, BasicResponse } from '@shared/types/users.ts'

export class UsersService {

	async userInfo(): Promise<UserResponse> {
		return await apiService.get<UserResponse>('/users/me');
	}

	async updateUsername(username: string): Promise<UserResponse> {
		return await apiService.post<UserResponse>('/users/me/update/username', username);
	}

	async updateAvatar(formData: FormData): Promise<UserResponse> {
		return await apiService.postFile<UserResponse>('/users/me/update/avatar', formData);
	}

	async updateEmail(email: string): Promise<UserResponse> {
		return await apiService.post<UserResponse>('/users/me/update/email', email);
	}

	async updatePassword(passwdData: UpdatePasswordData): Promise<UserResponse> {
		return await apiService.post<UserResponse>('/users/me/update/password', passwdData);
	}

	async addPassword(passwd: string): Promise<UserResponse> {
		return await apiService.post<UserResponse>('/users/me/add/password', passwd);
	}

	async getUsersFilters(sortBy: string, limit: string): Promise<UsersListResponse> {
		return await apiService.get<UsersListResponse>(`/users/leaderboard?sort=${sortBy}&limit=${limit}`);
	}

	async getNonFriends(): Promise<UsersListResponse> {
		return await apiService.get<UsersListResponse>(`/users/nonFriends`);
	}

	async getUsersOnline(): Promise<UsersListResponse> {
		return await apiService.get<UsersListResponse>('/users/online');
	}

	async getInvitationsStatus() {
		return await apiService.get('/users/invitations');
	}

	async anonymizeData(): Promise<BasicResponse> {
		return await apiService.get<BasicResponse>('/users/me/anonymize');
	}

	async deleteData(): Promise<BasicResponse> {
		return await apiService.get<BasicResponse>('/users/me/delete');
	}

	async requestData() {
		return await apiService.get('/users/me/data');
	}

}



export const usersService = new UsersService();
