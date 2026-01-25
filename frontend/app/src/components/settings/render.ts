
import type { UserResponse, UsersListResponse, UsersInfo, UserInfo } from '@shared/types/users.ts';
import type { AuthResponse } from '@shared/types/auth.ts';
import { usersService } from '../../services/users.ts';
import { authService } from '../../services/auth.ts';
import { blockUsersService } from '../../services/blockUsers.ts';
import { formatDateToLocal } from '../../utils/formatDate.ts';
import { catchHttpError } from '../../utils/catchError.ts';
import { setupSettingsListeners } from './listeners.ts';

function renderCard(): string {
	return /*ts*/`
		<div class="flex flex-col box-border text-[#d4ced4] lg:h-[80vh] h-[80vh] lg:w-[60vw] w-[80vw] bg-[#02010f88] border-solid border-2 border-[var(--color-primary)] rounded-[2rem] overflow-auto custom-scrollbar">
			<div class="flex-1 p-6 space-y-8">

				${renderEmailSettings()}
				${renderGoogleSettings()}
				${renderPasswdSettings()}
				${renderCreatePasswordCTA()}
				${renderTwoFASettings()}
				${renderBlockedUsers()}
				${renderPrivacySettings()}

			</div>
		</div>
	`;
}

function renderEmailSettings(): string {
	return /*ts*/`
		<div class="space-y-4">
			<h4 class="text-lg font-semibold text-[var(--color-primary)] flex items-center gap-2">
				Email Settings
			</h4>
			<div id='email-settings' class="bg-[#1a0c24]/50 rounded-xl p-4 border border-[var(--color-primary)]/20">
				<p class="text-sm text-[#888] mb-2">Current email:</p>
				<p id="current-email" class="text-[var(--color-primary-light)] font-mono mb-4">user@example.com</p>
				
				<div id='email-change' class="space-y-3">
					<input type="email" id="new-email" placeholder="Enter new email..."
						class="w-full p-3 bg-[var(--color-primary-bg)] border border-[var(--color-primary)] rounded-lg text-[#d4ced4] placeholder-[#888] focus:border-[var(--color-primary)] focus:outline-none transition-colors">
					<button id="update-email-btn"
						class="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-[#0c0511] font-bold py-2 px-4 rounded-lg hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-300 transform hover:scale-[1.02]">
						Update Email
					</button>
				</div>

				<span id='google-only-note' class='hidden text-sm text-[#888] mt-2 block'>
					Account linked to Google only. You cannot change your email.
				</span>
			</div>
		</div>
	`
}

function renderCreatePasswordCTA(): string {
	return /*ts*/`
		<div id="create-password-cta"
			class="bg-[#1a0c24]/50 rounded-xl p-4 border border-[var(--color-primary)]/20 hidden space-y-3">

			<p class="text-[#d4ced4] font-medium">
				No password set
			</p>

			<p class="text-sm text-[#888]">
				Add a password to secure your account and unlock more options.
			</p>

			<button id="create-password-btn"
				class="cursor-pointer w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]
				text-[#0c0511] font-bold py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02]">
				Create password
			</button>

			<form id="create-password-form" class="hidden space-y-3 mt-3">
				<input
					type="password"
					id="create-password"
					placeholder="New password..."
					class="w-full p-3 bg-[var(--color-primary-bg)] border border-[var(--color-primary)] rounded-lg text-[#d4ced4]"
				/>
				<input
					type="password"
					id="create-password-confirm"
					placeholder="Confirm password..."
					class="w-full p-3 bg-[var(--color-primary-bg)] border border-[var(--color-primary)] rounded-lg text-[#d4ced4]"
				/>
				<button
					type="submit"
					class="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-[#0c0511]
					font-bold py-2 rounded-lg hover:scale-[1.02] transition">
					Save password
				</button>

				<span id="create-password-error"
					class="hidden text-red-400 text-xs"></span>
			</form>
		</div>
	`;
}

function renderPasswdSettings(): string {
	return /*ts*/`
		<div class="space-y-4">
			<h4 class="text-lg font-semibold text-[var(--color-primary)] flex items-center gap-2">
				Password Settings
			</h4>
			<div id='passwd-settings' class="bg-[#1a0c24]/50 rounded-xl p-4 border border-[var(--color-primary)]/20">
				<form id='password-form'>
					<div class="space-y-3">
						<input type="password" id="current-password" placeholder="Current password..." name='current-password'
							class="w-full p-3 bg-[var(--color-primary-bg)] border border-[var(--color-primary)] rounded-lg text-[#d4ced4] placeholder-[#888] focus:border-[var(--color-primary)] focus:outline-none transition-colors">
						<input type="password" id="new-password" placeholder="New password..." name="new-password"
							class="w-full p-3 bg-[var(--color-primary-bg)] border border-[var(--color-primary)] rounded-lg text-[#d4ced4] placeholder-[#888] focus:border-[var(--color-primary)] focus:outline-none transition-colors">
						<button id="update-password-btn" type="submit"
							class="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-[#0c0511] font-bold py-2 px-4 rounded-lg hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-300 transform hover:scale-[1.02]">
							Update Password
						</button>
					</div>
				</form>
			</div>
		</div>
	`
}

function renderTwoFASettings(): string {
	return /*ts*/`
		<div class="space-y-4">
			<h4 class="text-lg font-semibold text-[var(--color-primary)] flex items-center gap-2">
				Two-Factor Authentication
			</h4>
			<div class="bg-[#1a0c24]/50 rounded-xl p-4 border border-[var(--color-primary)]/20">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-[#d4ced4] font-medium">Enable Two-Factor Authentication</p>
						<p class="text-sm text-[#888]">Add an extra layer of security</p>
					</div>
					<label class="relative inline-flex items-center cursor-pointer">
						<input type="checkbox" id="2fa-toggle" class="sr-only peer">
						<div class="relative w-11 h-6 bg-[var(--color-primary-bg)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[var(--color-primary)] peer-checked:to-[var(--color-primary-light)]"></div>
					</label>
				</div>
				<div id="2fa-status" class="mt-3 text-sm">
					<span class="text-red-400">Disabled</span>
				</div>
			</div>
		</div>
	`;
}

function renderBlockedUsers(): string {
	return /*ts*/`
		<div class="space-y-4">
			<h4 class="text-lg font-semibold text-[var(--color-primary)] flex items-center gap-2">
				Blocked Users
			</h4>
			<div class="bg-[#1a0c24]/50 rounded-xl p-4 border border-[var(--color-primary)]/20">
				<div class="max-h-40 overflow-auto custom-scrollbar">
					<ul id="blocked-users-list" class="space-y-2">
					</ul>
				</div>
				<p id="no-blocked-users" class="text-[#888] text-sm text-center py-4">
					No blocked users
				</p>
			</div>
		</div>
	`
}

function renderGoogleSettings(): string {
	return /*ts*/`
		<div id="google-settings" class="space-y-4">
			<h4 class="text-lg font-semibold text-[var(--color-primary)]">
				Google Account
			</h4>
			<div class="bg-[#1a0c24]/50 rounded-xl p-4 border border-[var(--color-primary)]/20">
				<div id="google-linked" class='hidden'>
					<div  class="flex items-center justify-between">
						<p class="text-[#d4ced4]">Google account linked</p>
						<span class="text-green-400 font-semibold">Connected</span>
					</div>

					<button id="unlink-google-btn"
						class="hidden cursor-pointer mt-4 text-red-400 hover:text-red-500 text-sm border rounded-lg py-2 px-4">
						Unlink Google account
					</button>

					<p id="google-unlink-warning"
						class="hidden text-sm text-[#888] mt-2 hidden">
						You must set a password before unlinking Google.
					</p>
				</div>

				<div id="google-not-linked" class='hidden'>
					<div class="flex items-center justify-between">
						<p class="text-[#d4ced4]">Google account not linked</p>
						<span class="text-red-400 font-semibold">Not Connected</span>
					</div>

					<button id="link-google-btn"
						class="cursor-pointer mt-4 text-[var(--color-primary)] text-sm border border-[var(--color-primary)] rounded-lg py-2 px-4 transition-all duration-300 transform hover:scale-[1.02]">
						Link Google account
					</button>

					<span id='google-link-error' class='hidden block text-red-400 text-sm pt-2'>
					</span>
				</div>

				
			</div>
		</div>
	`;
}

function renderPrivacySettings(): string {
	return /*ts*/`
	<div class="space-y-6">
		<h4 class="text-lg font-semibold text-[var(--color-primary)] flex items-center gap-2">
			Privacy
		</h4>

		<div class="space-y-1">
			<div class="bg-[#1a0c24]/50 border border-[var(--color-primary)]/20 rounded-xl p-4 flex justify-between items-center">
					<div class="flex flex-col min-w-0">
						<h5 class="text-base font-semibold text-[var(--color-primary)] mb-1">
							Request your data
						</h5>
						<p class="text-sm text-[#d4ced4] mb-1">
							Get a copy of all personal data we store about you.
						</p>
					</div>
					<div>
						<button id="request-data-btn"
							class="cursor-pointer px-4 py-1 text-sm whitespace-nowrap font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]
								text-[#0c0511] rounded-md hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-200">
							Request
						</button>
					</div>
			</div>

			<div class="bg-[#1a0c24]/50 border border-[var(--color-primary)]/20 rounded-xl p-4 flex justify-between items-center">
				<div class="flex flex-col min-w-0">
					<h5 class="text-base font-semibold text-[var(--color-primary)] mb-1">
						Anonymize account
					</h5>
					<p class="text-sm text-[#d4ced4] mb-1">
						Remove all personal identifiers. Your stats will remain.
					</p>
					<p class="text-xs text-red-400 my-1">
						This action is irreversible.
					</p>
				</div>
				<div class="flex-shrink-0">
					<button id="anonymize-account-btn"
						class="cursor-pointer px-2 py-1 text-sm font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]
							text-[#0c0511] rounded-md hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-200">
						Anonymize
					</button>
				</div>
			</div>

			<div class="bg-[#1a0c24]/50 border border-[var(--color-primary)]/20 rounded-xl p-4 flex justify-between items-center">
				<div class="flex flex-col min-w-0">
					<h5 class="text-base font-semibold text-[var(--color-primary)] mb-1">
						Delete account
					</h5>
					<p class="text-sm text-[#d4ced4] mb-1">
						Permanently delete your account and all associated personal data.
					</p>
					<p class="text-xs text-red-400 my-1">
						This action is irreversible.
					</p>
				</div>
				<div>
					<button id="delete-account-btn"
						class="cursor-pointer px-2 py-1 whitespace-nowrap text-sm font-bold bg-red-600 text-[#0c0511]
							rounded-md hover:bg-red-500 transition-all duration-200">
						Delete
					</button>
				</div>
			</div>

		</div>
	</div>

	<div id="privacy-confirm-overlay"
		class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 backdrop-blur-sm">

		<div class="bg-[#02010f] border-2 border-[var(--color-primary)]/40 rounded-2xl w-[90vw] max-w-md p-6 space-y-5">

			<h3 id="privacy-confirm-title"
				class="text-lg font-semibold text-[var(--color-primary)]">
				Confirm action
			</h3>

			<p id="privacy-confirm-message"
				class="text-sm text-[#d4ced4]">
				Are you sure you want to proceed?
			</p>

			<p id="privacy-confirm-warning"
				class="text-xs text-red-400 hidden">
				This action is irreversible.
			</p>

			<div class="flex justify-end gap-3 pt-4">
				<button id="privacy-confirm-cancel"
					class="cursor-pointer px-4 py-1.5 text-sm rounded-md border border-[var(--color-primary)]/40
					text-[#d4ced4] hover:bg-[var(--color-primary)]/10 transition">
					Cancel
				</button>

				<button id="privacy-confirm-validate"
					class="cursor-pointer px-4 py-1.5 text-sm font-bold rounded-md
					bg-red-600 text-[#0c0511] hover:bg-red-500 transition">
					Confirm
				</button>
			</div>

		</div>
	</div>
	`;
}


export function renderSettings(): string {
	return /*ts*/`
		<div id="settings-loader" class="flex justify-center items-center h-full">
			<span class="text-[var(--color-primary)] text-xl">Chargement...</span>
		</div>
		<div id="settings-content" style="display:none">
			<div class="flex flex-col h-full w-full p-4">
				<div class="text-center mb-4 flex-shrink-0">
					<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 relative">
						<span class="relative z-10">settings</span>
						<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
					</h2>
				</div>
				<div class="flex flex-col lg:flex-row gap-4 w-full flex-1 justify-center items-center">
					${renderCard()}
				</div>
			</div>
		</div>
	`;
}

function renderOneBlockedUser(user: UsersInfo): string {
	return /*ts*/`
		<li class="flex items-center gap-2 p-2 bg-[var(--color-primary-bg)]/50 rounded-lg">
			<div class="flex items-center gap-3 min-w-0 flex-1">
				<div class="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
					<span class="text-red-300 text-sm font-bold">
						${user.username.charAt(0)}
					</span>
				</div>
				<div class="min-w-0 flex flex-col">
					<p class="text-[#d4ced4] font-medium truncate leading-tight">
						${user.username}
					</p>
					<p class="text-xs text-[#9a8fa3] leading-tight">
						Blocked on ${formatDateToLocal(user.created_at as string)}
					</p>
				</div>
			</div>
			<button
				data-username="${user.username}"
				class="unblock-btn flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors whitespace-nowrap">
				Unblock
			</button>
		</li>
	`;
}

type AccountMode = 'LOCAL' | 'GOOGLE' | 'LINK' ;

function getAccountMode(user: UserInfo): AccountMode {
	if (user.google && user.isPasswd)
		return 'LINK';
	if (user.google && !user.isPasswd)
		return 'GOOGLE';
	return 'LOCAL';
}

export async function populateSettings() {
	try {
		const response: UserResponse = await usersService.userInfo();
		if (response.success && response.user) {
			const accountModde: AccountMode = getAccountMode(response.user);

			const currentEmailEl = document.getElementById('current-email');
			if (currentEmailEl)
				currentEmailEl.textContent = response.user.email as string;

			const emailChange = document.getElementById('email-change');
			const passwdSettings = document.getElementById('passwd-settings');
			const createPasswdCTA = document.getElementById('create-password-cta');
			const googleLinked = document.getElementById('google-linked');
			const googleUnlinkBtn = document.getElementById('unlink-google-btn');
			const googleNeedPasswd = document.getElementById('google-unlink-warning');
			const googleNotLinked = document.getElementById('google-not-linked');
			const noteGoogleOnly = document.getElementById('google-only-note');

			switch (accountModde) {
				case 'LOCAL':
					emailChange?.classList.remove('hidden');
					passwdSettings?.classList.remove('hidden');
					createPasswdCTA?.classList.add('hidden');
					googleNotLinked?.classList.remove('hidden');
					break;

				case 'GOOGLE':
					emailChange?.classList.add('hidden');
					passwdSettings?.classList.add('hidden');
					createPasswdCTA?.classList.remove('hidden');
					googleLinked?.classList.remove('hidden');
					noteGoogleOnly?.classList.remove('hidden');
					googleNeedPasswd?.classList.remove('hidden');
					break;

				case 'LINK':
					googleLinked?.classList.remove('hidden');
					googleUnlinkBtn?.classList.remove('hidden');
					break;
			}
		}

		const twoFAToggle = document.getElementById('2fa-toggle') as HTMLInputElement;
		const twoFAStatus = document.getElementById('2fa-status');
		const twofa_enabled: AuthResponse = await authService.check2FAStatus();
		// if (twofa_enabled.success && 'totp_required' in twofa_enabled.user) {
		if (twofa_enabled.success && twofa_enabled.user && twofa_enabled.user.totp_required) {
			if (twoFAToggle && twoFAStatus) {
				twoFAToggle.checked = twofa_enabled.user.totp_required;
				twoFAStatus.innerHTML = twofa_enabled.user.totp_required
					? '<span class="text-green-400">Enabled</span>'
					: '<span class="text-red-400">Disabled</span>';
			}
		}

		// Afficher par date de blocking
		const blockedUsersList = document.getElementById('blocked-users-list');
		const noBlockedUsers = document.getElementById('no-blocked-users');
		const usersBlocked: UsersListResponse = await blockUsersService.getBlockedUsers();
		if (usersBlocked.success && usersBlocked.users) {
			if (blockedUsersList && noBlockedUsers) {
				if (usersBlocked.users.length > 0) {
					noBlockedUsers.style.display = 'none';
					blockedUsersList.innerHTML = usersBlocked.users.map((user: UsersInfo) => renderOneBlockedUser(user)).join('');
				}
				else {
					noBlockedUsers.style.display = 'block';
					blockedUsersList.innerHTML = '';
				}
			}
		}


		// Si pb quand link Google
		const error = document.cookie
			.split('; ')
			.find(row => row.startsWith('oauth_error='))
			?.split('=')[1];
		console.log(error);
		if (error === 'already_linked') {
			const errorEl = document.getElementById('google-link-error');
			if (errorEl) {
				errorEl.textContent = 'This Google account is already associated with an existing account.';
				errorEl.classList.remove('hidden');
			}
			document.cookie = 'oauth_error=; Max-Age=0; path=/';
		}

		const loader = document.getElementById('settings-loader');
		const content = document.getElementById('settings-content');
		if (loader)
			loader.style.display = 'none';
		if (content)
			content.style.display = '';

		setupSettingsListeners();
	}
	catch (error) {
		catchHttpError('', error);
	}
}
