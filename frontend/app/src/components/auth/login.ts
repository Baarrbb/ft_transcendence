import { renderButtonEye, setupEyeButtonListeners } from './shared/buttons.ts';
import { renderSwitchButton } from './shared/buttons.ts';
import { renderButtonLogin } from './shared/buttons.ts';
import type { LoginData, AuthResponse } from '@shared/types/auth.ts'
import { authService } from '../../services/auth.ts';
import { clearAtInputEvent, renderErrors, showGeneralError, hideGeneralError } from '../../utils/formErrors.ts'
import { navigateTo } from '../../main.ts';
import { authStore } from '../../store/authStore.ts';

// <div class="flex items-center gap-2">
// 	<input type="checkbox" id="remember-me" name="remember" class="accent-[#66167e]">
// 	<label class="font-display text-[0.7rem] " for="remember-me" aria-label="">
// 		Remember me ?
// 	</label>
// </div>

function renderButtonsRememberForgot(): string {
	return /*ts*/`
		<div class="flex justify-between text-[#ccc] gap-[1rem]">
			<button type="button" class="font-display text-[var(--color-primary)] text-[0.7rem] font-[1000] z-10 hover:text-[var(--color-primary-light)] transition-colors duration-300"
				id="forgot_password">
				forgot password ?
			</button>
		</div>
	`
}

function renderButtonSignIn(): string {
	return /*ts*/`
		<div class="mt-[1.5vh] flex flex-col justify-center gap-[1rem]">
			<div id='general-error-login' class="hidden text-center">
			</div>

			<div class="grid grid-cols-[1fr_auto_1fr] items-center">
				<div></div>
				<div class="flex justify-center">
					${renderButtonLogin("sign in")}
				</div>
				<div class="flex justify-end">
					<button id="google_login"
						class="cursor-pointer bg-[#d4d4d4] p-2 text-[#02010F] rounded-2xl font-[100] border-2 border-transparent transition-all duration-300 ease-in-out hover:bg-[#f6f6f6] hover:border-[var(--color-primary)] hover:shadow-[0_0_10px_rgba(184,139,43,0.4)]"
						aria-label="login with Google">
						<img src="/logo/g.webp" class="h-[24px]" />
					</button>
				</div>
			</div>
		</div>
	`
}

export function renderLogin(): string {
	return /*ts*/`
		<div class="flex flex-col justify-center items-center">
			${renderSwitchButton("First time ?")}
			<div class="form p-8 bg-[#08050abb] relative grid justify-center border-[0.2vh] border-solid border-[var(--color-primary-bg)] z-2">
				<h2 class="text-[#ccc] left-[0] font-display right-[0] text-center whitespace-nowrap relative mb-0 text-[2rem] text-shadow-[2px_2px_#60087af6]">
					Sign in
				</h2>
				<form id='login-form' class="relative grid justify-center items-center m-[2vh] gap-[1.2vh] z-10">
					<div class="grid min-w-[300px] min-h-[75px] gap-1">
						<div class='grid gap-1' data-field='username'>
							<input class="relative p-3 border-[0.15rem] border-solid border-[#60087af6] rounded-[1vh] text-[#ccc] bg-[#1f0627e8] text-[1rem]" id="username_login" type="text" name="username" required placeholder="Username/email" minlength="3">
							<label for="username_login" aria-label="Username"></label>
						</div>

						<div class='grid gap-1' data-field='password'>
							<div class="flex justify-between">
								<input class="w-full relative p-3 border-[0.15rem] border-solid border-[#60087af6] rounded-[1vh] text-[#ccc] bg-[#1f0627e8] text-[1rem]"
									id="password_login" type="password" name="password" required placeholder="Password" minlength="8">
								<label for="password_login" aria-label="Password"></label>
								${renderButtonEye("")}
							</div>
						</div>
					</div>
					${renderButtonsRememberForgot()}
					${renderButtonSignIn()}
				</form>
				<div class="flex flex-row justify-center">
					<p class="text-xs text-[#888] mt-4 text-center">
						<a href="/privacy" class="underline hover:text-[var(--color-primary)] transition-colors mx-1">Privacy & Data</a>
					</p>
					<p class="text-xs text-[#888] mt-4 text-center">
						<a href="/terms" class="cursor-pointer underline hover:text-[var(--color-primary)] transition-colors mx-1">Terms & Services</a>
					</p>
				</div>
				<span id='google-link-error' class='hidden block text-red-400 text-sm pt-2'>
				</span>
			</div>
		</div>
	`
}

export function setupLoginListeners() {

	setupEyeButtonListeners("password_login", "");

	document.getElementById('switch-form')?.addEventListener('click', () => {
		navigateTo('register');
	});
	document.getElementById('forgot_password')?.addEventListener('click', () => {
		navigateTo('forgot');
	})

	const form = document.getElementById('login-form') as HTMLFormElement;
	const submitButton = document.getElementById('button_login') as HTMLButtonElement;

	clearAtInputEvent(['username_login', 'password_login'], "_login");

	submitButton.addEventListener('click', async (e) => {
		e.preventDefault();

		hideGeneralError();

		const formData = new FormData(form);
		const registerData: LoginData = {
			username: formData.get('username') as string,
			password: formData.get('password') as string,
			// remember: formData.get('remember-me') === 'on',
		};

		if (submitButton)
			submitButton.disabled = true;

		try {
			const response: AuthResponse = await authService.login(registerData);
			if (response.success) {
				authStore.setState('auth');
				navigateTo('main', 'home');
			}
			else if (!response.success && response.user?.totp_required) {
				authStore.setState('2fa_required');
				navigateTo('double-authentification');
			}
			else {
				if (response.message && (!response.errors || Object.keys(response.errors).length === 0))
					showGeneralError(response.message);
				else
					renderErrors(response, "_login");
			}
		}
		catch (error) {
			console.error('Registration error:', error);
		}
		finally {
			if (submitButton)
				submitButton.disabled = false;
		}
	});

	const googleBtn = document.getElementById('google_login')as HTMLButtonElement;

	googleBtn?.addEventListener('click', async () => {
		try {
			window.location.href = `/api/auth/google`;
		}
		catch (error) {
			console.error('Redirection error:', error);
		}
	})

	// Si pb quand co Google
	const error = document.cookie
		.split('; ')
		.find(row => row.startsWith('oauth_error='))
		?.split('=')[1];
	if (error === 'already_linked') {
		const errorEl = document.getElementById('google-link-error');
		if (errorEl) {
			errorEl.textContent = "This email is already associated with an account linked to another Google account.";
			errorEl.classList.remove('hidden');
		}
		document.cookie = 'oauth_error=; Max-Age=0; path=/';
	}

}

