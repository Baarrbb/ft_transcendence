import { renderButtonEye, setupEyeButtonListeners } from './shared/buttons.ts';
import { renderSwitchButton } from './shared/buttons.ts';
import { renderButtonLogin } from './shared/buttons.ts';
import type { RegisterData, AuthResponse } from '@shared/types/auth.ts'
import { authService } from '../../services/auth.ts';
import { clearAtInputEvent, renderErrors } from '../../utils/formErrors.ts'
import { navigateTo } from '../../main.ts';


function renderRegisterButton(): string {
	return /*ts*/`
		<div class="mt-[1.5vh] flex justify-center gap-[2rem]">
			${renderButtonLogin("sign up")}
		</div>
	`
}

export function renderRegister(): string {
	return /*ts*/`
	<div class="flex flex-col justify-center items-center">
		${renderSwitchButton("sign in")}
		<div class="form p-8 bg-[#08050abb] relative grid justify-center border-[0.2vh] border-solid border-[var(--color-primary-bg)] z-2">
			<h2 class="text-[#ccc] left-[0] font-display right-[0] text-center whitespace-nowrap relative mb-0 text-[2rem] text-shadow-[2px_2px_#60087af6]">
				Sign up
			</h2>
			<form id='register-form' class="relative grid justify-center items-center m-[2vh] gap-[1.2vh] z-10">
				<div class="grid min-w-[300px] min-h-[75px] gap-1">
					<div class='grid gap-1' data-field='email'>
						<input class="relative p-3 border-[0.15rem] border-solid border-[#60087af6] rounded-[1vh] text-[#ccc] bg-[#1f0627e8] text-[1rem]" 
							id="email_register" type="email" name="email" required placeholder="exemple@exemple.com">
						<label for="email_register" aria-label="enter email"></label>
					</div>
					
					<div class='grid gap-1' data-field='username'>
						<input class="relative p-3 border-[0.15rem] border-solid border-[#60087af6] rounded-[1vh] text-[#ccc] bg-[#1f0627e8] text-[1rem]" 
							id="username_register" type="text" name="username" required placeholder="Username" minlength="3">
						<label for="username_register" aria-label="enter username"></label>
					</div>

					<div class='grid gap-1' data-field='password'>
						<div class="flex justify-between">
							<input class="w-full relative p-3 border-[0.15rem] border-solid border-[#60087af6] rounded-[1vh] text-[#ccc] bg-[#1f0627e8] text-[1rem]" 
								id="password_register" type="password" name="password" required placeholder="Password" minlength="8">
							<label for="password_register" aria-label="enter new password"></label>
							${renderButtonEye("")}
						</div>
					</div>
				</div>
				${renderRegisterButton()}
			</form>
			<div class="flex flex-row justify-center">
				<p class="text-xs text-[#888] mt-4 text-center">
					<a href="/privacy" class="underline hover:text-[var(--color-primary)] transition-colors mx-1">Privacy & Data</a>
				</p>
				<p class="text-xs text-[#888] mt-4 text-center">
					<a href="/terms" class="cursor-pointer underline hover:text-[var(--color-primary)] transition-colors mx-1">Terms & Services</a>
				</p>
			</div>
		</div>
	</div>
	`
}



export function setupRegisterListeners(): void {

	setupEyeButtonListeners("password_register", "");

	document.getElementById('switch-form')?.addEventListener('click', () => {
		navigateTo('login');
	});

	const form = document.getElementById('register-form') as HTMLFormElement;
	const submitButton = document.getElementById('button_login') as HTMLButtonElement;

	clearAtInputEvent(['email_register', 'username_register', 'password_register'], "_register");

	submitButton.addEventListener('click', async (e) => {
		e.preventDefault();

		const formData = new FormData(form);
		const registerData: RegisterData = {
			email: formData.get('email') as string,
			username: formData.get('username') as string,
			password: formData.get('password') as string,
		};

		if (submitButton)
			submitButton.disabled = true;

		try {
			const response: AuthResponse = await authService.register(registerData);
			if (response.success) {
				authStore.setState('auth');
				navigateTo('main', 'home');
			}
			else
				renderErrors(response, "_register");
		}
		catch (error) {
			console.error('Registration error:', error);
		}
		finally {
			if (submitButton)
				submitButton.disabled = false;
		}
	})
}

import { authStore } from '../../store/authStore.ts';
