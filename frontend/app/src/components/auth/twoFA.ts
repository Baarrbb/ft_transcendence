
import type { AuthResponse } from '@shared/types/auth.ts'
import { authService } from '../../services/auth.ts';
import { navigateTo } from '../../main.ts';
import { authStore } from '../../store/authStore.ts';

export function renderTwoFactorAuthentification(): string {
	return /*ts*/`
		<div class="flex flex-col justify-center items-center">
			<div class="form p-8 bg-[#08050abb] relative grid justify-center border-[0.2vh] border-solid border-[var(--color-primary-bg)] z-2">
				<h2 class="text-[#ccc] left-[0] font-display right-[0] text-center whitespace-nowrap relative mb-0 text-[2rem] text-shadow-[2px_2px_#60087af6]">
					Two-Factor Authentication
				</h2>
				<form id='twofa-form' class="relative grid justify-center items-center m-[2vh] gap-[1.2vh] z-10">
					<div class="grid min-w-[300px] min-h-[75px] gap-4">
						<div class="flex justify-center gap-2">
							${[...Array(6)].map((_, i) => `
								<input
									class="w-12 h-12 text-center text-2xl border-[0.15rem] border-solid border-[#60087af6] rounded-[1vh] text-[#ccc] bg-[#1f0627e8] focus:border-[var(--color-primary)] outline-none transition-colors"
									id="twofa-digit-${i+1}"
									type="text"
									inputmode="numeric"
									maxlength="1"
									autocomplete="one-time-code"
									pattern="[0-9]*"
									required
								>
							`).join('')}
						</div>
						<div class="flex flex-col mt-[1.5vh] flex justify-center gap-[2rem]">
							<div id='general-error-2fa' class="hidden text-center text-red-400 text-sm"></div>
							<div class="flex justify-center">
								<button id="button_2fa" type="submit"
									class="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-[#0c0511] font-bold py-2 px-4 rounded-lg hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-300 transform hover:scale-[1.02]">
									Verify Code
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	`;
}

function renderError(msg: string) {
	const errorDiv = document.getElementById('general-error-2fa');
		if (errorDiv) {
			errorDiv.textContent = msg;
			errorDiv.classList.remove('hidden');
		}
}

export function setup2FAListeners() {
	const inputs = Array.from({ length: 6 }, (_, i) =>
		document.getElementById(`twofa-digit-${i + 1}`) as HTMLInputElement
	);

	inputs.forEach((input, idx) => {
		input.addEventListener('input', () => {
			const value = input.value;
			if (/^[0-9]$/.test(value) && idx < inputs.length - 1) {
				inputs[idx + 1].focus();
			}
			const errorDiv = document.getElementById('general-error-2fa');
			if (errorDiv)
				errorDiv.classList.add('hidden');
		});
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Backspace' && input.value === '' && idx > 0) {
				inputs[idx - 1].focus();
			}
		});
	});

	const verifyBtn = document.getElementById('button_2fa') as HTMLButtonElement;
	verifyBtn?.addEventListener('click', async (e) => {
		e.preventDefault();

		const codeTab = Array.from({ length: 6 }, (_, i) =>
			(document.getElementById(`twofa-digit-${i + 1}`) as HTMLInputElement).value);

		if (codeTab.some(val => val === '')) {
			renderError("6 digits needed");
			return ;
		}
		if (codeTab.some(val => !/^[0-9]$/.test(val))) {
			renderError("Only digit");
			return;
		}
		const code = codeTab.join('');

		try {
			const response: AuthResponse = await authService.verifyTOTP(code);
			if (response.success) {
				authStore.setState('auth');
				navigateTo('main', 'home');
			}
			else
				renderError(response.message);
		}
		catch (error) {
			console.error(error);
		}
	})
}
