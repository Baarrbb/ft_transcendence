import { renderSwitchButton, renderButtonLogin } from './shared/buttons.ts';
import type { AuthResponse } from '@shared/types/auth.ts';
import { authService } from '../../services/auth.ts';
import { navigateTo } from '../../main.ts';
import { renderErrors, clearAtInputEvent, hideGeneralError, showGeneralError, showResponse, hideResponse } from '../../utils/formErrors.ts';

export function renderForgotPassword(): string {
	return /*ts*/`
		<div class="flex flex-col justify-center items-center">
			${renderSwitchButton("Back to sign in")}
			<div class="form p-8 bg-[#08050abb] relative grid justify-center border-[0.2vh] border-solid border-[var(--color-primary-bg)] z-2">
				<h2 class="text-[#ccc] left-[0] font-display right-[0] text-center whitespace-nowrap relative mb-0 text-[2rem] text-shadow-[2px_2px_#60087af6]">
					reset password
				</h2>
				<form id='forgot-form' class="relative grid justify-center items-center m-[2vh] gap-[1.2vh] z-10">
					<div class="grid min-w-[300px] min-h-[75px] gap-1">
						<div class='grid gap-1' data-field='email'>
							<input class="relative p-3 border-[0.15rem] border-solid border-[#60087af6] rounded-[1vh] text-[#ccc] bg-[#1f0627e8] text-[1rem]" 
								id="email_forgot" type="email" name="email" required placeholder="exemple@exemple.com">
							<label for="email_forgot" aria-label="enter email"></label>
						</div>
						<div class="flex flex-col mt-[1.5vh] flex justify-center gap-[1rem]">
							<div id='general-error-login' class="hidden text-center">
							</div>
							<div class="flex justify-center">
								${renderButtonLogin("send email")}
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	`;
}

export function setupForgotListeners(): void {

	document.getElementById('switch-form')?.addEventListener('click', () => {
		navigateTo('login');
	});

	const form = document.getElementById('forgot-form') as HTMLFormElement;
	const submitButton = document.getElementById('button_login') as HTMLButtonElement;

	clearAtInputEvent(['email_forgot'], "_forgot");

	submitButton.addEventListener('click', async(e) => {
		e.preventDefault();
		hideGeneralError();
		hideResponse();
		const formData = new FormData(form);
		const email: string = formData.get('email') as string;
		if (submitButton) {
			submitButton.disabled = true;
		}
		try {
			const response: AuthResponse = await authService.forgotPassword(email);
			if (response.success) {
				showResponse("Email sent")
			}
			else {
				if (response.message && (!response.errors || Object.keys(response.errors).length === 0))
					showGeneralError(response.message);
				else
					renderErrors(response, "_forgot");
			}
		}
		catch (error) {
			console.error('Forgot password error:', error);
		}
		finally {
			if (submitButton)
				submitButton.disabled = false;
		}
	})
}
