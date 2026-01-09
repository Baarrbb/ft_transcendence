

import { authService } from '../services/auth.ts';
import { authStore } from '../store/authStore.ts';

export type Route = {
	page: string;
	view?: string;
	subView?: string
}

export async function detectPageFromURL(): Promise<Route> {
	const searchParams = new URLSearchParams(window.location.search);
	const token = searchParams.get('token');
	const parts = window.location.pathname.split("/");

	// a voir si on delegue valifateToken a /users/me
	if (parts[1] === 'reset-password') {
		if (!token)
			return { page: 'login' };
		const tokenStatus = await authService.validateToken(token);
		if (tokenStatus.success) {
			switch (tokenStatus.validateToken) {
				case 'invalid':
					return { page: 'login' };
				case 'expired':
					authStore.setState('reset_passwd_expired');
					return { page: 'expired-token' };
				case 'valid':
					authStore.setState('reset_passwd_allowed');
					return { page: 'reset-password' };
			}
		}
		return { page: 'login' };
	}
	else if (parts[1] === '' )
		return { page: 'login' };
	else
		return { 
			page: parts[1],
			view: parts[2],
			subView: parts[3]
		};
}
