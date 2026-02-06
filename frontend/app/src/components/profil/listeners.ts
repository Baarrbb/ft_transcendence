// ===== PROFIL LISTENERS =====
// Ce fichier gere les interactions utilisateur sur la page profil :
// - Changer son avatar (clic sur le bouton camera)
// - Modifier son username

import type { UserResponse } from '@shared/types/users.ts';
import { usersService } from '../../services/users.ts';
import { catchHttpError } from '../../utils/catchError.ts';
import { showNotification } from '../../utils/notification.ts';

// Envoie le nouvel avatar au serveur quand l'utilisateur choisit une image
async function changeAvatar(e: Event) {
	const userAvatar = document.getElementById('user-avatar') as HTMLImageElement;
	const file = (e.target as HTMLInputElement).files?.[0]; // recupere le fichier selectionne
	if (file) {
		const formData = new FormData();
		formData.append('avatar', file); // prepare le fichier pour l'envoi

		try {
			// Appel API pour mettre a jour l'avatar
			const response: UserResponse = await usersService.updateAvatar(formData);
			if (response.success && response.user?.avatar) {
				showNotification(response.message, 'success');
				const srcPath = '/uploads/';
				const fullPath = srcPath + response.user.avatar;
				userAvatar.src = fullPath; // met a jour l'image affichee
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

// Envoie le nouveau username au serveur
async function updateUsername(actualUsername: string) {
	const usernameInput = document.getElementById('username-input') as HTMLInputElement;

	// Si le username n'a pas change, on fait rien
	if (usernameInput.value === actualUsername)
		return ;
	try {
		// Appel API pour changer le username
		const response: UserResponse = await usersService.updateUsername(usernameInput.value);
		if (response.success)
			showNotification(response.message, 'success');
		else if (!response.success && response.errors && response.errors.username) {
			showNotification(response.errors.username, 'error');
			usernameInput.value = actualUsername; // remet l'ancien username si erreur
		}
	}
	catch (error) {
		catchHttpError('Username error:', error);
		showNotification('Update failed', 'error');
	}
}

// On garde les references des listeners pour pouvoir les supprimer proprement
let onChangeAvatarClick: ((e: Event) => void) | null = null;
let onAvatarInputChange: ((e: Event) => void) | null = null;
let onUsernameUpdateClick: ((e: Event) => void) | null = null;

// Met en place tous les event listeners de la page profil
// (clic avatar, selection fichier, clic bouton username)
export function setupProfilListeners() {
	const changeAvatarBtn = document.getElementById('change-avatar-btn');
	const avatarInput = document.getElementById('avatar-input') as HTMLInputElement;

	// Listener bouton camera : ouvre le selecteur de fichier
	if (onChangeAvatarClick)
		changeAvatarBtn?.removeEventListener('click', onChangeAvatarClick);
	onChangeAvatarClick = () => avatarInput?.click();
	changeAvatarBtn?.addEventListener('click', onChangeAvatarClick);

	// Listener fichier selectionne : envoie l'avatar
	if (onAvatarInputChange)
		avatarInput?.removeEventListener('change', onAvatarInputChange);
	onAvatarInputChange = changeAvatar;
	avatarInput?.addEventListener('change', onAvatarInputChange);

	// Listener bouton ✓ : met a jour le username
	const updateUsernameBtn = document.getElementById('update-username-btn');
	const usernameInput = document.getElementById('username-input') as HTMLInputElement;
	const actualUsername = usernameInput.value;
	if (onUsernameUpdateClick)
		updateUsernameBtn?.removeEventListener('click', onUsernameUpdateClick);
	onUsernameUpdateClick = function () { updateUsername(actualUsername) };
	updateUsernameBtn?.addEventListener('click', onUsernameUpdateClick);
}
