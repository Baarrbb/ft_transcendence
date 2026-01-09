

import type { AuthResponse } from '@shared/types/auth.ts'
import { renderButtonEye, setupEyeButtonListeners } from './shared/buttons.ts'
import { authService } from '../../services/auth.ts';
import { navigateTo } from '../../main.ts';
import { showGeneralError } from '../../utils/formErrors.ts'
import { authStore } from '../../store/authStore.ts';


export function renderLinkAccount(): string {
	return /*ts*/`
		<div class="flex flex-col justify-center items-center gap-8">
			<div class="bg-orange-900/20 border-2 border-orange-500/50 rounded-lg p-6 mb-6 max-w-md text-center backdrop-blur-sm">
				<h2 class="text-orange-400 text-xl font-semibold mb-3">
					An account already exists with this email.
				</h2>
				<p class="text-orange-300/70 text-sm">
					This account was created with a password. For security reasons, we need to verify that you are the owner.
				</p>
			</div>

			<div class="form p-8 bg-[#08050abb] relative grid justify-center border-[0.2vh] border-solid border-[var(--color-primary-bg)] z-2">
				<div class="flex flex-col gap-4 items-center min-w-[300px]">

					<button id="login-password" class="cursor-pointer w-full bg-transparent border-[0.15rem] border-solid border-[var(--color-primary-bg)] hover:border-[var(--color-primary)] text-[#ccc] hover:text-[var(--color-primary)] py-3 px-6 rounded-[1vh] transition-all duration-300">
						Log in with my password
					</button>

					<div class="w-full flex flex-col gap-1 justify-center items-center">
						<button id="link-account" class="cursor-pointer w-full bg-transparent border-[0.15rem] border-solid border-[var(--color-primary-bg)] hover:border-[var(--color-primary)] text-[#ccc] hover:text-[var(--color-primary)] py-3 px-6 rounded-[1vh] transition-all duration-300">
							Link my account to Google
						</button>

						<span class="text-xs text-[#aaa] pl-1">
							You will still be able to log in with your password.
						</span>

						<div id="link-form" class="hidden w-full mt-4">
							<label class="text-sm text-[#ccc] mb-1 block">
								Confirm your password to link your account
							</label>
							<div class="flex justify-between">
								<input id="link-password" type="password" class="w-full bg-transparent border border-[0.1rem] border-[var(--color-primary-bg)] rounded-md px-4 py-2 text-white" placeholder="Password"/>
								${renderButtonEye("")}
							</div>
	
							<div class="flex flex-col mt-[1.5vh] flex justify-center">
								<div id='general-error-login' class="hidden text-center">
								</div>
								<div class="flex justify-center">
									<button id="confirm-link" class="cursor-pointer mt-4 w-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)] text-[var(--color-primary)] py-2 rounded-md hover:bg-[var(--color-primary)]/20 transition">
										Confirm & link account
									</button>
								</div>
							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	`;
}

export function setupListenersLinkAccount() {

	document.getElementById('login-password')?.addEventListener('click', () => {
		authStore.setState('anon');
		navigateTo('login');
	});

	setupEyeButtonListeners("link-password", "");

	const linkBtn = document.getElementById('link-account');
	linkBtn?.addEventListener('click', () => {
		document.getElementById('link-form')?.classList.remove('hidden')
	})

	const confirmLinkBtn = document.getElementById('confirm-link') as HTMLButtonElement;
	const inputPass = document.getElementById('link-password') as HTMLInputElement;
	confirmLinkBtn?.addEventListener('click', async () => {
		if (confirmLinkBtn)
			confirmLinkBtn.disabled = true;
		if (inputPass?.value !== '') {
			try {
				const response: AuthResponse = await authService.linkGoogleAccount(inputPass?.value);
				if (response.success) {
					authStore.setState('auth');
					navigateTo('main', 'home');
				}
				else if (!response.success && response.user?.totp_required) {
					authStore.setState('2fa_required');
					navigateTo('double-authentification');
				}
				else {
					console.log('3333333333333333')
					showGeneralError(response.message);
				}
			}
			catch (error) {
				console.error('Linking error:', error);
			}
			finally {
				if (confirmLinkBtn)
					confirmLinkBtn.disabled = false;
			}
		}
	})
}
