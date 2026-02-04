


import { authStore } from './store/authStore.ts';

export function authGuard(page: string, view?: string, subView?: string): boolean {
	const state = authStore.getState();
	switch (page) {
		case 'double-authentification':
			return state === '2fa_required';
		case 'expired-token':
			return state === 'reset_passwd_expired';
		case 'reset-password':
			return state === 'reset_passwd_allowed';
		case 'link-account':
			return state === 'link_account_required';
		case 'main':
			if (view === 'home' && subView === 'local')
				return true;
			return state === 'auth';
		// case 'login':
		// 	return state === 'anon';
		// case 'register':
		// 	return state === 'anon';
		// case 'forgot':
		// 	return state === 'anon';
		case 'login':
		case 'register':
		case 'forgot':
			return state !== 'auth';
		case 'privacy':
			return true;
		case 'terms':
			return true;
		default:
			return false;
	}
}


export function fallbackGuard(): string {
	const state = authStore.getState();

	switch (state) {
		case 'anon':
			return 'login';
		case 'auth':
			return 'main';
		case '2fa_required':
			return 'double-authentification';
		case 'reset_passwd_allowed':
			return 'reset-password';
		case 'reset_passwd_expired':
			return 'expired-token';
		case 'link_account_required':
			return 'link-account';
		default:
			return 'login';
	}
}
