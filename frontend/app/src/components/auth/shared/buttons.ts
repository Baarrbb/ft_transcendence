

export function renderButtonEye(suffix: string): string {
	return /*ts*/`
		<button class="m-0 p-1 border-none bg-[var(--color-primary)] rounded-[1vh] right-[0] relative inline-block hover:bg-[var(--color-primary-light)] transition-colors duration-300"
			type="button" id="show_passw_login${suffix}">
			<span class="close_eye" id="pass_login_svg${suffix}"></span>
		</button>
	`
}


export function renderSwitchButton(text: string): string {
	return /*ts*/`
		<div class="z-15">
			<button class="bg-[#8A0B0B] p-4 text-[#ccc] rounded-4xl transition-all duration-300 ease-in-out hover:bg-[#6e0808] hover:scale-110 hover:-translate-y-1"
				id="switch-form" data-translate-key="first_time">
				${text}
			</button>
		</div>
	`
}

export function renderButtonLogin(text: string): string {
	return /*ts*/`
		<button type="submit"
			class="cursor-pointer bg-[#460b58] p-2 text-[var(--color-primary)] rounded-2xl text-lg font-[1000] border-2 border-transparent transition-all duration-300 ease-in-out hover:bg-[#66167e] hover:border-[var(--color-primary)] hover:shadow-[0_0_10px_rgba(184,139,43,0.4)]"
			id="button_login">
			${text}
		</button>
	`
}


export function setupEyeButtonListeners(inputId: string, extIdBtn: string) {
	const eyeBtn = document.getElementById(`show_passw_login${extIdBtn}`) as HTMLButtonElement;
	const passInput = document.getElementById(inputId) as HTMLInputElement;
	const eyeIcon = document.getElementById(`pass_login_svg${extIdBtn}`);

	let psswdVisible = false;
	eyeBtn?.addEventListener('click', () => {
		psswdVisible = !psswdVisible;
		if (psswdVisible) {
			passInput.type = 'text';
			eyeIcon?.classList.remove('close_eye');
			eyeIcon?.classList.add('open_eye');
		} else {
			passInput.type = 'password';
			eyeIcon?.classList.remove('open_eye');
			eyeIcon?.classList.add('close_eye');
		}
	})
}
