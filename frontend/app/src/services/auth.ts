
import { apiService } from './api.ts'
import type { RegisterData, AuthResponse, LoginData, ValidateToken, ResetPasswordData } from '@shared/types/auth.ts'
import type { BasicResponse } from '@shared/types/users.ts'

export class AuthService {

	async register(data: RegisterData): Promise<AuthResponse> {
		return await apiService.post<AuthResponse>('/auth/signup', data);
	}

	async login(data: LoginData): Promise<AuthResponse> {
		return await apiService.post<AuthResponse>('/auth/login', data);
	}

	async logout(): Promise<AuthResponse> {
		return await apiService.get<AuthResponse>('/auth/logout');
	}

	async forgotPassword(email: string): Promise<AuthResponse> {
		return await apiService.post<AuthResponse>('/auth/forgot-password', email);
	}

	async validateToken(token: string): Promise<ValidateToken> {
		return await apiService.post<ValidateToken>('/auth/validate-token', token);
	}

	async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
		return await apiService.post<AuthResponse>('/auth/reset-password', data);
	}

	async check2FAStatus(): Promise<AuthResponse> {
		return await apiService.get<AuthResponse>('/auth/2fa-status');
	}

	async change2FAStatus(enabled: boolean): Promise<AuthResponse> {
		return await apiService.post<AuthResponse>('/auth/2fa-change', enabled);
	}

	async verifyTOTP(totpData: string): Promise<AuthResponse> {
		return await apiService.post<AuthResponse>('/auth/2fa-verify', totpData);
	}

	async linkGoogleAccount(password: string) {
		return await apiService.post<AuthResponse>('/auth/google/link-account', password);
	}

	async unlinkGoogleAccount() {
		return await apiService.get<BasicResponse>('/auth/google/unlink');
	}

}

export const authService = new AuthService();
