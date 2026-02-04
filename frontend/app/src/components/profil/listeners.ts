
import type { UserResponse } from '@shared/types/users.ts';
import { usersService } from '../../services/users.ts';
import { catchHttpError } from '../../utils/catchError.ts';
import { showNotification } from '../../utils/notification.ts';

async function changeAvatar(e: Event) {
	const userAvatar = document.getElementById('user-avatar') as HTMLImageElement;
	const file = (e.target as HTMLInputElement).files?.[0];
	if (file) {
		const formData = new FormData();
		formData.append('avatar', file);

		try {
			const response: UserResponse = await usersService.updateAvatar(formData);
			if (response.success && response.user?.avatar) {
				showNotification(response.message, 'success');
				const srcPath = '/uploads/';
				const fullPath = srcPath + response.user.avatar;
				userAvatar.src = fullPath;
			}
			else if (!response.success && response.errors && response.errors.avatar)
				showNotification(response.errors.avatar, 'error');
		}
		catch (error) {
			catchHttpError('Avatar Update failed:', error);
			showNotification('Avatar Update failed', 'error');
		}
	}
}

async function updateUsername(actualUsername: string) {
	const usernameInput = document.getElementById('username-input') as HTMLInputElement;

	if (usernameInput.value === actualUsername)
		return ;
	try {
		const response: UserResponse = await usersService.updateUsername(usernameInput.value);
		if (response.success)
			showNotification(response.message, 'success');
		else if (!response.success && response.errors && response.errors.username) {
			showNotification(response.errors.username, 'error');
			usernameInput.value = actualUsername;
		}
	}
	catch (error) {
		catchHttpError('Username error:', error);
		showNotification('Update failed', 'error');
	}
}

let onChangeAvatarClick: ((e: Event) => void) | null = null;
let onAvatarInputChange: ((e: Event) => void) | null = null;
let onUsernameUpdateClick: ((e: Event) => void) | null = null;

export function setupProfilListeners() {
	const changeAvatarBtn = document.getElementById('change-avatar-btn');
	const avatarInput = document.getElementById('avatar-input') as HTMLInputElement;

	if (onChangeAvatarClick)
		changeAvatarBtn?.removeEventListener('click', onChangeAvatarClick);
	onChangeAvatarClick = () => avatarInput?.click();
	changeAvatarBtn?.addEventListener('click', onChangeAvatarClick);

	if (onAvatarInputChange)
		avatarInput?.removeEventListener('change', onAvatarInputChange);
	onAvatarInputChange = changeAvatar;
	avatarInput?.addEventListener('change', onAvatarInputChange);

	const updateUsernameBtn = document.getElementById('update-username-btn');
	const usernameInput = document.getElementById('username-input') as HTMLInputElement;
	const actualUsername = usernameInput.value;
	if (onUsernameUpdateClick)
		updateUsernameBtn?.removeEventListener('click', onUsernameUpdateClick);
	onUsernameUpdateClick = function () { updateUsername(actualUsername) };
	updateUsernameBtn?.addEventListener('click', onUsernameUpdateClick);
}
