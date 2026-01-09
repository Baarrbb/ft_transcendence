
import HttpError from './httpError.ts'
import { navigateTo } from '../main.ts'
import { authStore } from '../store/authStore.ts'

export function catchHttpError(msg: string, error: unknown) {
	console.error(msg, error);
	if (error instanceof HttpError) {
		authStore.setState('anon');
		navigateTo('login');
		return ;
	}
}
