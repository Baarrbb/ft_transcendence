
import type { AuthResponse } from '@shared/types/auth.ts'


export function clearAtInputEvent(inputs: string[], rmInField: string) {
	inputs.forEach(inputId => {
		const input = document.getElementById(inputId) as HTMLInputElement;
		input?.addEventListener('input', () => {
			const fieldName = inputId.replace(rmInField, '');
			const container = document.querySelector(`[data-field="${fieldName}"]`)
			const errorMessage = container?.querySelector('.error-message');
			if (errorMessage) {
				input.classList.remove('border-red-500', 'border-[0.2rem]');
				input.classList.add('border-[#60087af6]');
				errorMessage.remove();
			}
		});
	});
}

export function renderErrors(response: AuthResponse, suffixeId: string) {
	if (response.errors) {
		Object.entries(response.errors).forEach(([field, messages]) => {
			if (Array.isArray(messages) && messages.length > 0) {
				const input = document.getElementById(`${field}${suffixeId}`) as HTMLInputElement;
				const container = document.querySelector(`[data-field="${field}"]`)

				if (input && container) {
					const existingError = container.querySelector('.error-message');
					existingError?.remove();
					input.classList.add('border-red-500', 'border-[0.2rem]');
					input.classList.remove('border-[#60087af6]');

					const errorDiv = document.createElement('div');
					errorDiv.className = 'error-message text-red-400 text-sm';
					errorDiv.textContent = messages[0];
					
					container.appendChild(errorDiv);
				}
			}
		})
	}
}

export function showGeneralError(message: string) {
	const container = document.getElementById('general-error-login');
	if (container) {
		container.className = 'text-red-400 text-sm text-center';
		container.textContent = message;
		container.classList.remove('hidden');
	}

}

export function hideGeneralError() {
	const container = document.getElementById('general-error-login');
	if (container) {
		container.classList.add('hidden');
		container.textContent = '';
	}
}

export function showResponse(message: string) {
	const container = document.getElementById('general-error-login');
	if (container) {
		container.className = 'text-green-400 text-sm text-center';
		container.textContent = message;
		container.classList.remove('hidden');
	}

}

export function hideResponse() {
	const container = document.getElementById('general-error-login');
	if (container) {
		container.classList.add('hidden');
		container.textContent = '';
	}
}