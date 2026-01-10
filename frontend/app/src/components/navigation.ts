
import { authService } from '../services/auth.ts';
import { showNotification } from '../utils/notification.ts';
import { manageSocketUser } from '../socket.ts'
import { cleanupPong } from './home/localMode/play1v1.ts'
import { cleanupOnlinePong } from './home/online/pong/clean.ts';
import { cleanSubscription } from './home/online/utils.ts';
import { navigateTo } from '../main.ts';
import { authStore } from '../store/authStore.ts';


export function renderNav(): string {
	return /*ts*/`
		<nav class="fixed left-0 top-0 h-screen w-[5rem] z-10" id="nav_menu">
			<ul class="list-none w-full p-0 m-0 h-full">
				<fieldset class="px-3 flex flex-col gap-[3vh] bg-[var(--color-primary-bg)] border-r-[0.2vh] border-solid border-[var(--color-primary)] h-full justify-center items-center">
					<legend class="hidden translate" data-translate-key="legend_menu"></legend>
					
					<div class="flex flex-col gap-[3vh] justify-center items-center">
						<li class="opt_menu home" id="home_ref">
							<input type="radio" class="appearance-none hidden" name="navigation" id="radio_home" checked>
							<label class="relative inline-block" for="radio_home" aria-label="home game">
								<span class="ic--round-home w-[5.5vh] h-[5.5vh]"></span>
								<span id="notif_game" class="absolute -top-1 -right-1 flex size-3 hidden">
									<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
									<span class="relative inline-flex size-3 rounded-full bg-red-500"></span>
								</span>
							</label>
						</li>
						<li class="opt_menu podium">
							<input type="radio" class="appearance-none hidden" name="navigation" id="radio_podium">
							<label for="radio_podium" aria-label="dashboard">
								<span class="mdi--podium-gold w-[5.5vh] h-[5.5vh]"></span>
							</label>
						</li>
						<li class="opt_menu friends">
							<input type="radio" class="appearance-none hidden" name="navigation" id="radio_friends">
							<label class="relative translate flex items-center" for="radio_friends" aria-label="list of friends">
								<span class="fa-solid--user-friends w-[5.5vh] h-[5.5vh]"></span>
								<span id="notif_friends" class="absolute -top-1 -right-1 flex size-3 hidden">
									<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
									<span class="relative inline-flex size-3 rounded-full bg-red-500"></span>
								</span>
							</label>
						</li>
						<li class="opt_menu parameter">
							<input type="radio" class="appearance-none hidden" name="navigation" id="radio_parameters">
							<label class="translate" for="radio_parameters" aria-label="parameter">
								<span class="ph--gear-six-fill w-[5.5vh] h-[5.5vh]"></span>
							</label>
						</li>
						<li class="opt_menu profil">
							<input type="radio" class="appearance-none hidden" name="navigation" id="radio_profil">
							<label class="translate" for="radio_profil" aria-label="profil">
								<span class="fa-solid--id-card w-[5.5vh] h-[5.5vh]"></span>
							</label>
						</li>
						<li class="opt_menu chat">
							<input type="radio" class="appearance-none hidden" name="navigation" id="radio_chat">
							<label class="relative translate flex items-center" for="radio_chat" aria-label="profil">
								<span class="heroicons-solid--chat w-[5.5vh] h-[5.5vh]"></span>
								<span id="notif_chat" class="absolute -top-1 -right-1 flex size-3 hidden">
									<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
									<span class="relative inline-flex size-3 rounded-full bg-red-500"></span>
								</span>
							</label>
						</li>
						<li class="opt_menu credit">
							<input type="radio" class="appearance-none hidden" name="navigation" id="radio_credit">
							<label class="translate" for="radio_credit" aria-label="parameter">
								<span class="game-icons--flying-beetle w-[5.5vh] h-[5.5vh]"></span>
							</label>
						</li>
						<li class="opt_menu logout">
							<button id="logout_button" class="logout">
								<span class="humbleicons--logout w-[5.5vh] h-[5.5vh]"></span>
							</button>
						</li>
					</div>
				</fieldset>
			</ul>
		</nav>
	`;
}

export function setupNavListeners(changeView: (view: string) => void) {

	document.getElementById('radio_home')?.addEventListener('click', () => {
		changeView('home');
	});

	document.getElementById('radio_podium')?.addEventListener('change', () => {
		changeView('dashboard');
	});

	document.getElementById('radio_friends')?.addEventListener('change', () => {
		changeView('friends');
	});

	document.getElementById('radio_parameters')?.addEventListener('change', () => {
		changeView('parameters');
	});

	document.getElementById('radio_profil')?.addEventListener('change', () => {
		changeView('profil');
	});

	// change ? Ou click ? click permet de retourbver l'affichage avec list friend connected
	// document.getElementById('radio_chat')?.addEventListener('change', () => {
	document.getElementById('radio_chat')?.addEventListener('click', () => {
		(window as any).__chatUsername = null;
		changeView('chat');
		// const notif = document.getElementById('notif_chat');
		// notif?.classList.remove('hidden');
	});

	document.getElementById('radio_credit')?.addEventListener('change', () => {
		changeView('credit');
	});

	document.getElementById('logout_button')?.addEventListener('click', async () => {
		try {
			manageSocketUser('off');

			// clearHandlers();
			cleanupPong();
			cleanSubscription();
			if (document.getElementById('pong-canvas'))
				cleanupOnlinePong();
			const response = await authService.logout();
			if (response.success) {
				authStore.setState('anon');
				navigateTo('login');
			}
		}
		catch (error) {
			authStore.setState('anon');
			navigateTo('login');
			showNotification("Internal server error", 'error');
		}
	});
}

export function updateRadioButtons(currentView: string) {

	const allRadios = document.querySelectorAll('input[name="navigation"]');
	allRadios.forEach((radio: Element) => {
		(radio as HTMLInputElement).checked = false;
	});

	const radioMap: { [key: string]: string } = {
		'home': 'radio_home',
		'dashboard': 'radio_podium', 
		'friends': 'radio_friends',
		'parameters': 'radio_parameters',
		'profil': 'radio_profil',
		'notifs': 'radio_notif',
		'chat': 'radio_chat',
		'credit': 'radio_credit'
	};

	const targetRadio = document.getElementById(radioMap[currentView]) as HTMLInputElement;
	if (targetRadio) {
		targetRadio.checked = true;
	}
}

