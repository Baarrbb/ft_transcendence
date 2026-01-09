

import { renderButtonLogin } from './shared/buttons.ts';
import type { AuthResponse, ResetPasswordData } from '@shared/types/auth.ts';
// import { authService } from '../services/auth.ts';
import { renderButtonEye, setupEyeButtonListeners } from './shared/buttons.ts';
import { authService } from '../../services/auth.ts';
import { renderErrors, clearAtInputEvent, hideGeneralError, showGeneralError, showResponse, hideResponse } from '../../utils/formErrors.ts';
import { navigateTo } from '../../main.ts';

export function renderResetPassword(): string {
	return /*ts*/`
		<div class="flex flex-col justify-center items-center">

			<div class="form p-8 bg-[#08050abb] relative grid justify-center border-[0.2vh] border-solid border-[var(--color-primary-bg)] z-2">
				<h2 class="text-[#ccc] left-[0] font-display right-[0] text-center whitespace-nowrap relative mb-0 text-[2rem] text-shadow-[2px_2px_#60087af6]">
					reset password
				</h2>
				<form id='reset-form' class="relative grid justify-center items-center m-[2vh] gap-[1.2vh] z-10">
					<div class="grid min-w-[300px] min-h-[75px] gap-1">
						<div class='grid gap-1' data-field='password'>
							<div class="flex justify-between">
								<input class="w-full relative p-3 border-[0.15rem] border-solid border-[#60087af6] rounded-[1vh] text-[#ccc] bg-[#1f0627e8] text-[1rem]" 
									id="password_reset" type="password" name="password" required placeholder="New password" minlength="8">
								<label for="password_reset" aria-label="enter new password"></label>
								${renderButtonEye("")}
							</div>
						</div>

						<div class='grid gap-1' data-field='confirmPassword'>
							<div class="flex justify-between">
								<input class="w-full relative p-3 border-[0.15rem] border-solid border-[#60087af6] rounded-[1vh] text-[#ccc] bg-[#1f0627e8] text-[1rem]" 
									id="confirmPassword_reset" type="password" name="passwordConfirm" required placeholder="Confirm password" minlength="8">
								<label for="confirmPassword_reset" aria-label="enter new password"></label>
								${renderButtonEye("_confirm")}
							</div>
						</div>

						<div class="flex flex-col mt-[1.5vh] flex justify-center gap-[2rem]">
							<div id='general-error-login' class="hidden text-center">
							</div>
							<div class="flex justify-center">
								${renderButtonLogin("update")}
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	`;
}

export function renderExpiredTokenError(): string {
	return /*ts*/`
		<div class="flex flex-col justify-center items-center">

			<div class="bg-orange-900/20 border-2 border-orange-500/50 rounded-lg p-6 mb-6 max-w-md text-center backdrop-blur-sm">
				<h2 class="text-orange-400 text-xl font-semibold mb-3">Reset Link Expired</h2>
				<p class="text-orange-300/70 text-sm">
					Reset links are valid for 1 hour only.
				</p>
			</div>

			<div class="form p-8 bg-[#08050abb] relative grid justify-center border-[0.2vh] border-solid border-[var(--color-primary-bg)] z-2">
				<div class="flex flex-col gap-4 items-center min-w-[300px]">

					<button id="request-new-reset" class="w-full bg-[#60087af6] hover:bg-[var(--color-primary)] text-[#ccc] font-semibold py-3 px-6 rounded-[1vh] border-[0.15rem] border-solid border-[#60087af6] hover:border-[var(--color-primary)] transition-all duration-300">
						Request New Reset Link
					</button>

					<button id="back-to-login" class="w-full bg-transparent border-[0.15rem] border-solid border-[var(--color-primary-bg)] hover:border-[var(--color-primary)] text-[#ccc] hover:text-[var(--color-primary)] py-3 px-6 rounded-[1vh] transition-all duration-300">
						← Back to Login
					</button>
				</div>
			</div>
		</div>
	`;
}


function replaceWithLoginButton(): void {
	const submitButton = document.getElementById('button_login') as HTMLButtonElement;
	if (submitButton) {
		submitButton.textContent = 'Go to Login';
		submitButton.disabled = false;
		submitButton.className = 'w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-[1vh] border-[0.15rem] border-solid border-green-600 hover:border-green-700 transition-all duration-300';

		submitButton.replaceWith(submitButton.cloneNode(true));
		const newButton = document.getElementById('button_login') as HTMLButtonElement;
		
		newButton.addEventListener('click', (e) => {
			e.preventDefault();
			// const url = new URL(window.location.href);
			// url.search = '';
			// url.pathname = '/';
			// window.history.replaceState({}, '', url.toString());
			authStore.setState('anon');
			navigateTo('login');
		});
	}
}

import { authStore } from '../../store/authStore.ts';

function replaceWithResendButton(): void {
	const submitButton = document.getElementById('button_login') as HTMLButtonElement;
	if (submitButton) {
		submitButton.textContent = 'Send new link';
		submitButton.disabled = false;
		submitButton.className = 'w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-[1vh] border-[0.15rem] border-solid border-red-600 hover:border-red-700 transition-all duration-300';

		submitButton.replaceWith(submitButton.cloneNode(true));
		const newButton = document.getElementById('button_login') as HTMLButtonElement;
		
		newButton.addEventListener('click', (e) => {
			e.preventDefault();
			// const url = new URL(window.location.href);
			// url.search = '';
			// url.pathname = '/';
			// window.history.replaceState({}, '', url.toString());
			authStore.setState('anon');
			navigateTo('forgot');
		});
	}
}


export function setupResetListeners(): void {

	setupEyeButtonListeners("password_reset", "");
	setupEyeButtonListeners("confirmPassword_reset", "_confirm");

	const form = document.getElementById('reset-form') as HTMLFormElement;
	const submitButton = document.getElementById('button_login') as HTMLButtonElement;

	const searchParams = new URLSearchParams(window.location.search);
	const token = searchParams.get('token');

	clearAtInputEvent(['password_reset', 'confirmPassword_reset'], "_reset");

	submitButton?.addEventListener('click', async(e) => {
		e.preventDefault();
		hideGeneralError();
		hideResponse();
		const formData = new FormData(form);
		const resetData: ResetPasswordData = {
			token: token as string,
			password: formData.get('password') as string,
			confirmPassword: formData.get('passwordConfirm') as string,
		};

		if (submitButton)
			submitButton.disabled = true;

		try {
			const response: AuthResponse = await authService.resetPassword(resetData);
			if (response.success) {
				showResponse("Password updated successfully");
				replaceWithLoginButton();
			}
			else {
				if (response.message && (!response.errors || Object.keys(response.errors).length === 0)) {
					showGeneralError(response.message);
					if (response.expired_token) {
						replaceWithResendButton();
					}
				}
				else
					renderErrors(response, "_reset");
			}
		}
		catch (error) {
			console.error('Password error:', error);
		}
		finally {
			if (submitButton)
				submitButton.disabled = false;
		}
	})
}