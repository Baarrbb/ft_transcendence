import { apiService } from './api.ts';
import type { BasicResponse } from '@shared/types/users.ts';

export class MatchService {

	async invitationsStatus() {
		return await apiService.get('/match/invitations/status');
	}

	async addInvitation(username: string): Promise<BasicResponse> {
		return await apiService.post<BasicResponse>('/match/invitations/add', username)
	}

	async cancelInvitation(username: string): Promise<BasicResponse> {
		return await apiService.post<BasicResponse>('/match/invitations/cancel', username)
	}

	async declineInvitation(username: string): Promise<BasicResponse> {
		return await apiService.post<BasicResponse>('/match/invitations/decline', username);
	}

	async acceptInvitation(username: string) {
		return await apiService.post('/match/invitations/accept', username);
	}

	async getMatchHistory() {
		return await apiService.get('/match/history');
	}

	async getMatchHistoryUser(username: string) {
		return await apiService.post('/match/history', username);
	}

	async getEvolution() {
		return await apiService.get('/match/evolution');
	}

	async getEvolutionUser(username: string) {
		return await apiService.post('/match/evolution', username);
	}

	async getInvitationStatus(username: string) {
		return await apiService.post('/match/invitations/status', username);
	}

}

export const matchService = new MatchService();
