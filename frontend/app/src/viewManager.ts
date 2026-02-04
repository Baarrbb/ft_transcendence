
import { renderLogo } from './utils/logo.ts'
import { renderLogin, setupLoginListeners } from './components/auth/login.ts'
import { renderRegister, setupRegisterListeners } from './components/auth/register.ts'
import { renderForgotPassword, setupForgotListeners } from './components/auth/forgot.ts'
import { renderResetPassword, renderExpiredTokenError, setupResetListeners } from './components/auth/reset.ts'
import { renderTwoFactorAuthentification, setup2FAListeners } from './components/auth/twoFA.ts'
import { renderDashboard, populateDashboard } from './components/dashboard/render.ts'
import { renderFriends, populateFriends } from './components/friends/render.ts'
// import { renderCredits } from './components/credits/credits.ts'
import { renderSettings, populateSettings } from './components/settings/render.ts'
import { renderProfil, populateProfil } from './components/profil/render.ts'
import { populateOneChat } from './components/chat/render.ts'
import { renderChat, populateChat } from './components/chat/render.ts'
import { renderNav } from './components/navigation.ts'
import { setupNavListeners, updateRadioButtons } from './components/navigation.ts'
import { renderHome, setupListenersHome } from './components/home/home.ts'
import { cleanupPong } from './components/home/localMode/play1v1.ts'
import { cleanupOnlinePong } from './components/home/online/pong/clean.ts'
import { setupListenersLocalGame, renderLocalGame } from './components/home/localMode/localGameMode.ts';
import { populateConnectedUsers, renderOnlineGame } from './components/home/online/render.ts';
import { renderTournmt, setupListenersTournmt } from './components/home/tournament/renderMode.ts';
import { renderRegisterLocalTournament, setupListenersRegisterTournament }  from './components/home/tournament/localTournament/registerLocalTournament.ts';
import { cleanupPongMatch } from './components/home/tournament/localTournament/playMatch.ts';
import { renderLinkAccount, setupListenersLinkAccount } from './components/auth/oauth.ts';
// import { renderPrivacy } from './components/credits/privacy.ts';


export const viewManager = {

	showLogin(appEl: HTMLElement) {
		// localStorage.setItem('currentPage', 'login');
		appEl.innerHTML = /*ts*/`
			<div class="flex items-center justify-center h-screen relative">
				${renderLogo()}
				${renderLogin()}

				<a id="local-btn" href="/main/home/local"
					class="underline absolute top-0 left-0 cursor-pointer select-none text-gray-400 transition-transform duration-150 z-20">
					as Guest
				</a>
			</div>
		`;

		const btn = document.getElementById('local-btn') as HTMLElement;
		const parent = btn.parentElement as HTMLElement;
		const form = document.getElementById('login-form') as HTMLElement;

		btn.style.position = 'absolute';
		btn.style.zIndex = '20';
		btn.style.top = `${parent.clientHeight - btn.offsetHeight - 24}px`;
		btn.style.left = `${parent.clientWidth - btn.offsetWidth - 24}px`;

		const triggerDistance = 25;

		parent.addEventListener('mousemove', (e) => {
			const btnRect = btn.getBoundingClientRect();
			const btnX = btnRect.left + btnRect.width / 2;
			const btnY = btnRect.top + btnRect.height / 2;

			const dx = e.clientX - btnX;
			const dy = e.clientY - btnY;
			const dist = Math.sqrt(dx*dx + dy*dy);

			if (dist < triggerDistance) {
				const parentWidth = parent.clientWidth;
				const parentHeight = parent.clientHeight;

				const formRect = form.getBoundingClientRect();
				const formLeft = formRect.left - parent.getBoundingClientRect().left;
				const formTop = formRect.top - parent.getBoundingClientRect().top;

				let newLeft: number, newTop: number;
				let attempts = 0;

				do {
					newLeft = Math.random() * (parentWidth - btn.offsetWidth);
					newTop = Math.random() * (parentHeight - btn.offsetHeight);
					attempts++;
				} while (
					newLeft + btn.offsetWidth > formLeft &&
					newLeft < formLeft + form.offsetWidth &&
					newTop + btn.offsetHeight > formTop &&
					newTop < formTop + form.offsetHeight &&
					attempts < 50
				);

				if (attempts >= 50) {
					newLeft = parentWidth - btn.offsetWidth - 24;
					newTop = parentHeight - btn.offsetHeight - 24;
				}

				btn.style.left = `${newLeft}px`;
				btn.style.top = `${newTop}px`;
			}
		});

		// <a href="/main/home/local" class="underline text-white hover:text-[var(--color-primary)] transition-colors">Local</a>

		setupLoginListeners();
	},

	showRegister(appEl: HTMLElement) {
		// localStorage.setItem('currentPage', 'register');
		appEl.innerHTML = /*ts*/`
			<div class="flex items-center justify-center h-screen relative">
				${renderLogo()}
				${renderRegister()}
			</div>
		`;

		// document.getElementById('switch-form')?.addEventListener('click', () => {
		// 	// this.showLogin(appEl);
		// 	navigateTo('login');
		// });
		setupRegisterListeners();
	},

	showForgot(appEl: HTMLElement) {
		// localStorage.setItem('currentPage', 'forgot');
		appEl.innerHTML = /*ts*/`
			<div class="flex items-center justify-center h-screen relative">
				${renderLogo()}
				${renderForgotPassword()}
			</div>
		`;
		// document.getElementById('switch-form')?.addEventListener('click', () => {
		// 	// this.showLogin(appEl);
		// 	navigateTo('login');
		// });
		setupForgotListeners();
	},

	showResetPassword(appEl: HTMLElement) {
		appEl.innerHTML = /*ts*/`
			<div class="flex items-center justify-center h-screen relative">
				${renderLogo()}
				${renderResetPassword()}
			</div>
		`;
		setupResetListeners();
	},

	clearUrl() {
		const url = new URL(window.location.href);
		url.search = '';
		url.pathname = '/';
		window.history.replaceState({}, '', url.toString());
	},

	showExpiredToken(appEl: HTMLElement) {
		appEl.innerHTML = /*ts*/`
			<div class="flex items-center justify-center h-screen relative">
				${renderLogo()}
				${renderExpiredTokenError()}
			</div>
		`;

		document.getElementById('back-to-login')?.addEventListener('click', () => {
			// this.clearUrl();
			// this.showLogin(appEl);
			authStore.setState('anon');
			navigateTo('login');
		});
		document.getElementById('request-new-reset')?.addEventListener('click', () => {
			// this.clearUrl();
			// this.showForgot(appEl);
			authStore.setState('anon');
			navigateTo('forgot');
		});
	},

	showTwoFA(appEl: HTMLElement) {
		// localStorage.setItem('currentPage', 'double-authentification');
		appEl.innerHTML = /*ts*/`
			<div class="flex items-center justify-center h-screen relative">
				${renderLogo()}
				${renderTwoFactorAuthentification()}
			</div>
		`;
		setup2FAListeners();
	},

	showLinkAccount(appEl: HTMLElement) {
		appEl.innerHTML = /*ts*/`
			<div class="flex items-center justify-center h-screen relative">
				${renderLogo()}
				${renderLinkAccount()}
			</div>
		`;
		setupListenersLinkAccount();
	},

	// ${renderPrivacy()}

	showPrivacy(appEl: HTMLElement) {
		appEl.innerHTML = /*ts*/`
			<div class="flex items-center justify-center h-screen relative">
				
			</div>
		`;
	},

	findSubView(currentSubView: string): string {
		console.log("subView", currentSubView);
		switch(currentSubView) {
			case 'local':
				setTimeout(() => setupListenersLocalGame(), 0);
				return renderLocalGame();
			case 'online':
				setTimeout(async () => await populateConnectedUsers(), 0);
				return renderOnlineGame();
			case 'tournament':
				const params = new URLSearchParams(window.location.search);
				const mode = params.get('mode');
				console.log("mode", mode);
				if (mode === 'local') {
					setTimeout(() => setupListenersRegisterTournament(), 0);
					return renderRegisterLocalTournament()
				}
				else if (mode === 'online') {
					// setTimeout(async () => await populateConnectedUsers(), 0);
					// return renderOnlineGame();
					// setTimeout(() => setupListenersInviteOnlineTournament(), 0);
					// return renderInviteOnlineTournament();
				}
				setTimeout(() => setupListenersTournmt(), 0);
				return renderTournmt();
			default:
				setTimeout(() => setupListenersHome(), 0);
				return renderHome();
		}
	},

	renderCurrentView(currentView: string, currentSubView: string): string {
		switch(currentView) {
			case 'home':
				return this.findSubView(currentSubView);
			case 'dashboard':
				setTimeout(async () => { await populateDashboard() }, 0);
				return renderDashboard();
			case 'friends':
				setTimeout(async () => { await populateFriends() }, 0);
				return renderFriends();
			case 'parameters':
				setTimeout(async () => { await populateSettings() }, 0);
				return renderSettings();
			case 'profil':
				setTimeout(async () => { await populateProfil() }, 0);
				return renderProfil();
			case 'chat':
				setTimeout(async () => {
					const username = (window as any).__chatUsername;
					if (username)
						await populateOneChat(username)
					else
						await populateChat()
				}, 0);
				return renderChat();
			// case 'credit':
			// 	return renderCredits();
			default:
				setTimeout(() => setupListenersHome(), 0);
				return renderHome();
		}
	},

	showApp(appEl: HTMLElement, currentView: string, currentSubView: string) {
		appEl.innerHTML = /*ts*/`
			<div class="">
				${renderNav()}
				<main id="main-content" class="absolute top-0 left-20 right-0 bottom-0">
					${viewManager.renderCurrentView(currentView, currentSubView)}
				</main>
			</div>
		`;
	
		setupNavListeners((view: string) => this.changeView(view));
		updateRadioButtons(currentView);
	},

	changeView(view: string) {
		console.log('changeView')
		// clearHandlers();
		cleanupPong();
		cleanupPongMatch();
		cleanSubscription();
		if (document.getElementById('pong-canvas'))
			cleanupOnlinePong();
		navigateTo('main', view);
		const mainContent = document.getElementById('main-content');
		if (mainContent)
			mainContent.innerHTML = viewManager.renderCurrentView(view, '');

		// history.replaceState({ page: 'main', view }, '', `/main/${view}`);
	}

}

import { authStore } from './store/authStore.ts';
import { navigateTo } from './main.ts';
import { cleanSubscription } from './components/home/online/utils.ts';
