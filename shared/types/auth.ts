
export interface RegisterData {
	email: string;
	username: string;
	password: string;
}

export interface LoginData {
	username: string;
	password: string;
	// remember: boolean;
}

export interface AuthErrors {
	email?: string[];
	username?: string[];
	password?: string[];
	confirmPassword?: string[];
}

export interface AuthResponse {
	success: boolean;
	message: string;
	user?: {
		user_id?: string;
		remember?: boolean;
		totp_required?: boolean;
	};
	expired_token?: boolean;
	errors?: AuthErrors;
	has2fa?: any;
	link_token?: any;
	linked?: boolean;
	totp_token?: string;
}

export interface ResetPasswordData {
	token: string;
	password: string;
	confirmPassword: string;
}

export interface ValidateToken {
	success: boolean;
	message?: string;
	validateToken?: 'valid' | 'expired' | 'invalid';
}
