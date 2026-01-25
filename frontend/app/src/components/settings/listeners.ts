
import type { UserResponse, UpdatePasswordData, BasicResponse } from '@shared/types/users.ts';
import type { AuthResponse } from '@shared/types/auth.ts';
import { authService } from '../../services/auth.ts';
import { usersService } from '../../services/users.ts';
import { blockUsersService } from '../../services/blockUsers.ts';
import { showNotification } from '../../utils/notification.ts';
import { catchHttpError } from '../../utils/catchError.ts';
import { getSocketUser } from '../../socket.ts';
import { authStore } from '../../store/authStore.ts';
import { navigateTo } from '../../main.ts';
import { createOverlay, createTitle } from '../commonLayout.ts';

async function updateEmail() {
	const newEmailInput = document.getElementById('new-email') as HTMLInputElement;
	const currentEmailEl = document.getElementById('current-email');
	if (newEmailInput.value === currentEmailEl?.textContent || !newEmailInput.value)
		return ;

	try {
		const response: UserResponse = await usersService.updateEmail(newEmailInput.value);
		if (response.success && currentEmailEl) {
			currentEmailEl.textContent = newEmailInput.value;
			newEmailInput.value = '';
			showNotification(response.message, 'success');
		}
		else if (!response.success && response.errors && response.errors.email)
			showNotification(response.errors.email, 'error');
	}
	catch (error) {
		catchHttpError('Update email failed', error);
		showNotification('Update failed', 'error');
	}
}

async function updatePassword(e: Event) {
	const form = document.getElementById('password-form') as HTMLFormElement;
	if (!form)
		return;
	e.preventDefault();

	const currentPasswordInput = document.getElementById('current-password') as HTMLInputElement;
	const newPasswordInput = document.getElementById('new-password') as HTMLInputElement;

	if (!currentPasswordInput?.value || !newPasswordInput?.value)
		return;

	const formData = new FormData(form);
	const passwdData: UpdatePasswordData = {
		actualPassword: formData.get('current-password') as string,
		newPassword: formData.get('new-password') as string,
	};

	try {
		const response: UserResponse = await usersService.updatePassword(passwdData);
		if (response.success) {
			showNotification(response.message, 'success');
			currentPasswordInput.value = '';
			newPasswordInput.value = '';
		}
		else if (!response.success) {
			if (response.errors && response.errors.newPassword)
				showNotification(response.errors.newPassword, 'error');
			if (response.errors && response.errors.password)
				showNotification(response.errors.password, 'error');
		}
	}
	catch (error) {
		catchHttpError('Update email failed', error);
		showNotification('Update failed', 'error');
	}
}

async function changeTwoFA(last2FAState: boolean) {
	const twoFAToggle = document.getElementById('2fa-toggle') as HTMLInputElement;
	const twoFAStatus = document.getElementById('2fa-status');
	try {
		const response: AuthResponse = await authService.change2FAStatus(twoFAToggle.checked);
		if (!response.success) {
			showNotification(response.message, 'error');
			twoFAToggle.checked = last2FAState;
		}
		else if (response.success && response.totp_token) {
			const overlay = createOverlay('totp-overlay');
			if (!overlay)
				return;
			const title = createTitle("Your private token");

			const codeContainer = document.createElement('div');
			codeContainer.className = `relative w-full px-4 py-2 bg-[#111] border border-[var(--color-primary)] rounded-lg
				select-text cursor-pointer flex justify-center items-center whitespace-normal break-words text-center`;

			const code = document.createElement('p');
			code.innerText = response.totp_token;
			code.className = `text-white font-mono text-lg m-0 text-center overflow-hidden break-words line-clamp-2`;
			codeContainer.appendChild(code);

			const tooltip = document.createElement('span');
			tooltip.innerText = 'Copied';
			tooltip.className = 'absolute top-0 right-0 mt-1 mr-2 text-xs text-green-400 opacity-0 transition-opacity';
			codeContainer.appendChild(tooltip);

			codeContainer.addEventListener('click', (e) => {
				e.stopPropagation();
				navigator.clipboard.writeText(response.totp_token!).then(() => {
					tooltip.classList.remove('opacity-0');
					setTimeout(() => tooltip.classList.add('opacity-0'), 1000);
				});
			});

			overlay.appendChild(title);
			overlay.appendChild(codeContainer);
		}
	}
	catch (error) {
		catchHttpError('', error);
		showNotification("Internal server error", 'error');
		twoFAToggle.checked = last2FAState;
	}
	if (twoFAStatus) {
		twoFAStatus.innerHTML = twoFAToggle.checked
			? '<span class="text-green-400">Enabled</span>'
			: '<span class="text-red-400">Disabled</span>';
	}
}

async function unblockUser(e: Event) {
	const blockedUsersList = document.getElementById('blocked-users-list');
	const noBlockedUsers = document.getElementById('no-blocked-users');
	const target = e.target as HTMLElement
	if (target.classList.contains('unblock-btn')) {
		const username = target.getAttribute('data-username') as string;
		const listItem = (e.target as HTMLElement).closest('li');
		if (listItem) {
			try {
				const response: BasicResponse = await blockUsersService.unblockUser(username);
				if (response.success) {
					showNotification(response.message, 'success');
					listItem.remove();
					if (blockedUsersList && blockedUsersList.children.length === 0 && noBlockedUsers)
						noBlockedUsers.style.display = 'block';
					const socket = getSocketUser();
					socket?.send(JSON.stringify({
						type: "unblock",
						username: username
					}))
				}
				else
					showNotification(response.message, 'error');
			}
			catch (error) {
				catchHttpError('', error);
				showNotification("Internal server error", 'error');
			}
		}
	}
}

async function unlinkGoogle() {
	try {
		const response: BasicResponse = await authService.unlinkGoogleAccount();
		if (response.success) {
			showNotification(response.message, 'success');
			const googleLinked = document.getElementById('google-linked');
			console.log(googleLinked)
			googleLinked?.classList.add('hidden');

			const googleNotLinked = document.getElementById('google-not-linked');
			console.log(googleNotLinked)
			googleNotLinked?.classList.remove('hidden');
		}
		else
			showNotification(response.message, 'error');
	}
	catch (error) {
		catchHttpError('', error);
		showNotification("Internal server error", 'error');
	}
}

async function handleCreatePassword() {
	const createBtn = document.getElementById('create-password-btn');
	createBtn?.classList.add('hidden');
	const passwdForm = document.getElementById('create-password-form');
	passwdForm?.classList.remove('hidden');

	if (onSetNewPasswordCLick)
		passwdForm?.removeEventListener('submit', onSetNewPasswordCLick);
	onSetNewPasswordCLick = setPassword;
	passwdForm?.addEventListener('submit', onSetNewPasswordCLick);
}

async function setPassword(e: Event) {
	e.preventDefault();

	const pwd = (document.getElementById('create-password') as HTMLInputElement).value;
	const confirm = (document.getElementById('create-password-confirm') as HTMLInputElement).value;
	const errorEl = document.getElementById('create-password-error');

	if (pwd !== confirm) {
		errorEl!.textContent = 'Passwords do not match.';
		errorEl!.classList.remove('hidden');
		return;
	}

	errorEl?.classList.add('hidden');

	const res = await usersService.addPassword(pwd);
	if (!res.success) {
		if (res.errors) {
			const firstError = Object.values(res.errors)[0] as string;
			if (firstError) {
				errorEl!.textContent = firstError;
				errorEl!.classList.remove('hidden');
				return;
			}
		}
		errorEl!.textContent = res.message;
		errorEl!.classList.remove('hidden');
		return;
	}

	window.location.reload();
}



type PrivacyAction = 'anonymize' | 'delete';

function openPrivacyConfirm(action: PrivacyAction) {
	const overlay = document.getElementById('privacy-confirm-overlay')!;
	const title = document.getElementById('privacy-confirm-title')!;
	const message = document.getElementById('privacy-confirm-message')!;
	const warning = document.getElementById('privacy-confirm-warning')!;
	const confirmBtn = document.getElementById('privacy-confirm-validate')!;

	if (action === 'anonymize') {
		title.textContent = 'Anonymize account';
		message.textContent =
			'All personal identifiers will be removed. Your game stats will remain.';
		
		confirmBtn.classList.remove('bg-red-600');
		confirmBtn.classList.add('bg-[var(--color-primary)]');
	}
	else {
		title.textContent = 'Delete account';
		message.textContent =
			'Your account and all personal data will be permanently deleted.';
		confirmBtn.classList.remove('bg-[var(--color-primary)]');
		confirmBtn.classList.add('bg-red-600');
	}

	warning.classList.remove('hidden');
	overlay.classList.remove('hidden');
	overlay.classList.add('flex');
}

function closePrivacyConfirm() {
	const overlay = document.getElementById('privacy-confirm-overlay')!;
	overlay.classList.add('hidden');
	overlay.classList.remove('flex');
}

let onPrivacyConfirmClick: ((e: Event) => void) | null = null;
let onPrivacyCancelClick: ((e: Event) => void) | null = null;

async function openConfirmAnonymizeData() {

	openPrivacyConfirm('anonymize');

	const confirmBtn = document.getElementById('privacy-confirm-validate');
	const cancelBtn = document.getElementById('privacy-confirm-cancel');

	if (onPrivacyConfirmClick)
		confirmBtn?.removeEventListener('click', onPrivacyConfirmClick);
	onPrivacyConfirmClick = anonymizeData;
	confirmBtn?.addEventListener('click', onPrivacyConfirmClick);

	if (onPrivacyCancelClick)
		cancelBtn?.removeEventListener('click', onPrivacyCancelClick);
	onPrivacyCancelClick = closePrivacyConfirm;
	cancelBtn?.addEventListener('click', onPrivacyCancelClick);

}

async function anonymizeData() {
	try {
		await usersService.anonymizeData();
		closePrivacyConfirm();

		const socketGame = getSocketUser();
		socketGame?.send(JSON.stringify({
			type: "anonymize",
		}));

		const response = await authService.logout();
		if (response.success) {
			authStore.setState('anon');
			navigateTo('login');
		}
	}
	catch (error) {
		catchHttpError('', error);
		showNotification("Internal server error", 'error');
	}
}

async function openConfirmDeleteData() {

	openPrivacyConfirm('delete');

	const confirmBtn = document.getElementById('privacy-confirm-validate');
	const cancelBtn = document.getElementById('privacy-confirm-cancel');

	if (onPrivacyConfirmClick)
		confirmBtn?.removeEventListener('click', onPrivacyConfirmClick);
	onPrivacyConfirmClick = deleteData;
	confirmBtn?.addEventListener('click', onPrivacyConfirmClick);

	if (onPrivacyCancelClick)
		cancelBtn?.removeEventListener('click', onPrivacyCancelClick);
	onPrivacyCancelClick = closePrivacyConfirm;
	cancelBtn?.addEventListener('click', onPrivacyCancelClick);

}

async function deleteData() {
	try {
		const socketGame = getSocketUser();
		socketGame?.send(JSON.stringify({
			type: "delete",
		}));
		await usersService.deleteData();
		closePrivacyConfirm();

		authStore.setState('anon');
		navigateTo('login');
	}
	catch (error) {
		catchHttpError('', error);
		showNotification("Internal server error", 'error');
	}
}

function downloadJSON(data: any, filename: string) {
	const dataStr = JSON.stringify(data, null, 2);
	const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(dataStr);
	var downloadNode = document.createElement('a');
	downloadNode.setAttribute("href", jsonStr);
	downloadNode.setAttribute("download", filename);
	document.body.appendChild(downloadNode);
	downloadNode.click();
	downloadNode.remove();
}

async function requestData() {
	try {
		const data = await usersService.requestData();
		downloadJSON(data, 'request_data.json');
	}
	catch (error) {
		catchHttpError('', error);
		showNotification("Internal server error", 'error');
	}
}


let onUpdateEmailClick: ((e: Event) => void) | null = null;
let onUpdatePasswordClick: ((e: Event) => void) | null = null;
let onTwoFAChange: ((e: Event) => void) | null = null;
let onUnblockUserClick: ((e: Event) => void) | null = null;
let onUnlinkGoogleClick: ((e: Event) => void) | null = null;
let onLinkGoogleClick: ((e: Event) => void) | null = null;
let onCreatePasswdClick: ((e: Event) => void) | null = null;
let onSetNewPasswordCLick: ((e: Event) => void) | null = null;

let onRequestCLick: ((e: Event) => void) | null = null;
let onAnonymizeCLick: ((e: Event) => void) | null = null;
let onDeleteCLick: ((e: Event) => void) | null = null;

export function setupSettingsListeners() {
	const updateEmailBtn = document.getElementById('update-email-btn');
	if (onUpdateEmailClick)
		updateEmailBtn?.removeEventListener('click', onUpdateEmailClick);
	onUpdateEmailClick = updateEmail;
	updateEmailBtn?.addEventListener('click', onUpdateEmailClick);

	const updatePasswordBtn = document.getElementById('update-password-btn');
	if (onUpdatePasswordClick)
		updatePasswordBtn?.removeEventListener('click', onUpdatePasswordClick);
	onUpdatePasswordClick = updatePassword;
	updatePasswordBtn?.addEventListener('click', onUpdatePasswordClick);

	const twoFAToggle = document.getElementById('2fa-toggle') as HTMLInputElement;
	const last2FAState = twoFAToggle?.checked;
	if (onTwoFAChange)
		twoFAToggle?.removeEventListener('change', onTwoFAChange);
	onTwoFAChange = function () { changeTwoFA(last2FAState) }
	twoFAToggle?.addEventListener('change', onTwoFAChange);

	const blockedUsersList = document.getElementById('blocked-users-list');
	if (onUnblockUserClick)
		blockedUsersList?.removeEventListener('click', onUnblockUserClick);
	onUnblockUserClick = unblockUser;
	blockedUsersList?.addEventListener('click', onUnblockUserClick);

	const unlinkBtn = document.getElementById('unlink-google-btn');
	if (onUnlinkGoogleClick)
		unlinkBtn?.removeEventListener('click', onUnlinkGoogleClick);
	onUnlinkGoogleClick = unlinkGoogle;
	unlinkBtn?.addEventListener('click', onUnlinkGoogleClick);

	const linkBtn = document.getElementById('link-google-btn');
	if (onLinkGoogleClick)
		linkBtn?.removeEventListener('click', onLinkGoogleClick);
	onLinkGoogleClick = function() { 
		try {
			window.location.href = `/api/auth/google`;
		}
		catch (error) {
			console.error('Redirection error:', error);
		}
	}
	linkBtn?.addEventListener('click', onLinkGoogleClick);

	const createBtn = document.getElementById('create-password-btn');
	if (onCreatePasswdClick)
		createBtn?.removeEventListener('click', onCreatePasswdClick);
	onCreatePasswdClick = handleCreatePassword;
	createBtn?.addEventListener('click', onCreatePasswdClick);


	const reqBtn = document.getElementById('request-data-btn');
	if (onRequestCLick)
		reqBtn?.removeEventListener('click', onRequestCLick);
	onRequestCLick = requestData;
	reqBtn?.addEventListener('click', onRequestCLick);

	const anonBtn = document.getElementById('anonymize-account-btn');
	if (onAnonymizeCLick)
		anonBtn?.removeEventListener('click', onAnonymizeCLick);
	onAnonymizeCLick = openConfirmAnonymizeData;
	anonBtn?.addEventListener('click', onAnonymizeCLick);

	const delBtn = document.getElementById('delete-account-btn');
	if (onDeleteCLick)
		delBtn?.removeEventListener('click', onDeleteCLick);
	onDeleteCLick = openConfirmDeleteData;
	delBtn?.addEventListener('click', onDeleteCLick);
}
