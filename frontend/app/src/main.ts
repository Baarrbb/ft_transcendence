
import { manageSocketUser } from './socket.ts';
import { viewManager } from './viewManager.ts';
import { detectPageFromURL } from './utils/urlDetector.ts';
import { usersService } from './services/users.ts';
import { cleanupOnlinePong }  from './components/home/online/pong/clean.ts'
import { cleanSubscription } from './components/home/online/utils.ts';
import { authStore } from './store/authStore.ts';
import { authGuard, fallbackGuard } from './accesGuard.ts';
import { getSocketUser } from './socket.ts';

// currentPage = main | login | register | forgot | expired-token | reset-password | \
// 				double-authentification | link-account
// 
// currentView = home | dashboard | friends | parameters | profil | chat | credit
// currentSubView = local | online | tournament
// mode = local | online (uniquement pour tournament)


// AuthFlowState = 'anon' | '2fa_required' | 'auth' | 
// 					'reset_passwd_allowed' | 'reset_passwd_expired' | 'link_account_required' 


// a ajouter pour local mode bot ou friend



class App {
  private appEl: HTMLElement;
  private currentPage: string;
  private currentView: string;
  private currentSubView: string;

  private routes: { [page: string]: (el: HTMLElement) => void };

//   private protectedPages = ['main'];
//   private preAuthPage = ['double-authentification'];
//   private publicPages = ['login', 'register', 'forgot', 'expired-token', 'reset-password', 'link-account'];

  constructor() {
	console.log('constructor');
	this.appEl = document.getElementById('app')!;
	this.currentPage = '';
	this.currentView = '';
	this.currentSubView = '';

	this.routes = {
		login: (el) => viewManager.showLogin(el),
		register: (el) => viewManager.showRegister(el),
		forgot: (el) => viewManager.showForgot(el),
		'reset-password': (el) => viewManager.showResetPassword(el),
		'expired-token': (el) => viewManager.showExpiredToken(el),
		'double-authentification': (el) => viewManager.showTwoFA(el),
		'link-account': (el) => viewManager.showLinkAccount(el),
		'privacy': (el) => viewManager.showPrivacy(el),
		'terms': (el) => viewManager.showTerms(el),
		main: (el) => {
			manageSocketUser('on');
			viewManager.showApp(el, this.currentView, this.currentSubView);
		}
	};

	window.addEventListener('popstate', async () => {

		cleanSubscription();
		if (document.getElementById('pong-canvas'))
			cleanupOnlinePong();

		console.log('popstate', this.currentPage, history.state.page);
		if (!history.state)
			return;
		if (!authGuard(history.state.page, history.state.view)) {
			this.currentPage = fallbackGuard();
			if (this.currentPage === 'main')
				this.currentView = 'home';
			else
				this.currentView = '';
			this.currentSubView = '';
			this.updateURL(true);
			this.route();
			return;
		}
		this.currentPage = history.state.page;
		this.currentView = history.state.view;
		this.currentSubView = history.state.subView || '';
		this.route();
	});

	window.addEventListener('navigate', (event) => {
		console.log('navigate');
		const { page, view, subView, query, username } = (event as CustomEvent).detail;
		this.currentPage = page;
		this.currentView = view || 'home';
		this.currentSubView = subView || '';

		this.updateURL(false, query);

		if (page === 'main' && view === 'chat' && username)
			(window as any).__chatUsername = username;

		// this.updateURL();
		this.route();
	});
  }

  private async route() {
	console.log('route', this.currentPage, authStore.getState());
	// if (!this.authGuard()) {
	// 	console.log("jai return false ??")
	// 	return;
	// }
	if (!authGuard(this.currentPage, this.currentView, this.currentSubView)) {
		navigateTo(fallbackGuard());
		return;
	}
	const routeFn = this.routes[this.currentPage];
	if (!routeFn) {
		this.currentPage = 'login';
		this.currentView = '';
		this.updateURL(true);
		this.route();
		return;
	}
	routeFn(this.appEl);
  }

  private updateURL(replace: boolean = false, query?: Record<string, string | null>) {
	console.log('updateURL', this.currentPage);
	const url = new URL(window.location.href);
	url.pathname = '/' + this.currentPage;

	if (this.currentPage === 'main') {
		url.pathname += '/' + this.currentView;
		if (this.currentView === 'home' && this.currentSubView)
			url.pathname += '/' + this.currentSubView;
	}
	if (this.currentPage === 'main' || this.currentPage === 'reset-password') {
		if (query) {
			Object.entries(query).forEach(([k, v]) => {
				if (v === null)
					url.searchParams.delete(k);
				else
					url.searchParams.set(k, v);
			});
		}
		else if (this.currentView === 'home' && this.currentSubView !== 'tournament')
			url.search = '';
	}
	else
		url.search = '';

	const state = {
		page: this.currentPage,
		view: this.currentView,
		subView: this.currentSubView
	};

	if (replace)
		history.replaceState(state, '', url);
	else
		history.pushState(state, '', url);
  }

  public async init() {
	console.log('init');

	const { page, view, subView } = await detectPageFromURL();
	console.log('p', page, 'v', view, 's', subView)
	await checkAuth();
	this.currentPage = authGuard(page, view, subView) ? page : fallbackGuard();

	if (this.currentPage === 'main') {
		const parts = window.location.pathname.split('/');
		this.currentView = parts[2] || 'home';
		this.currentSubView = parts[3] || '';
	}

	// if (!history.state)
		this.updateURL(true);
	this.route();
  }

  public getView(): string {
	return this.currentView;
  }

  public getSubView(): string {
	return this.currentSubView;
  }

  public getSubViewMode(): string {
	if (this.currentSubView === 'tournament') {
		const params = new URLSearchParams(window.location.search);
		const mode = params.get('mode');
		if (mode)
			return mode;
	}
	return '';
	// faire la meme pour mode local si besoin et si implementer
  }
}



export function navigateTo(page: string, view?: string, subView?: string, query?: Record<string, string | null>, username?: string) {
	if (app?.getView() === 'chat') {
		const socket = getSocketUser();
		socket?.send(JSON.stringify({
			type: 'chat:leave',
		}));
	}
	
	console.log('navigateTo:', page, view, subView);
	const event = new CustomEvent('navigate', {
		detail: { page, view, subView, query, username }
	});
	window.dispatchEvent(event);
}

export async function checkAuth() {
	try {
		console.log('checkAuth');
		const res = await usersService.userInfo();
		console.log(res);
		if (res.success && res.user)
			authStore.setState('auth');
		else if (!res.success && res.code === 'LINK_ACCOUNT')
			authStore.setState('link_account_required');
		else if (!res.success && (res.code === '2FA_REQUIRED' || sessionStorage.getItem('user_id')))
			authStore.setState('2fa_required');
	}
	catch (error) {
	}
}

const isDev = import.meta.env.DEV;

let app: App | null = null;

async function startApp() {
	console.log('startApp');
	app = new App();
	await app.init();
}

window.addEventListener('DOMContentLoaded', async () => {
	// if ((window as any).__appInitialized) {
	// 	console.warn('App already initialized - skipping second init');
	// 	return;
	// }
	// (window as any).__appInitialized = true;
	console.log('DOMContentLoaded');
	startApp();
});


if (isDev && import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('♻️ DEV TS change → reload');
		window.location.reload();
	});
}

export function getAppView(): string {
	return app ? app.getView() : '';
}

export function getAppSubView(): string {
	return app ? app.getSubView() : '';
}

// export function getAppSubViewMode(): string {
// 	return app ? app.getSubViewMode() : '';
// }

// function notifNewChat(data: any) {
// 	if (data.type === 'chat:new_msg') {
// 		const notif = document.getElementById('notif_chat');
// 		notif?.classList.remove('hidden');
// 	}
// }

// Faire fichier avec socket global, genre chat ou invitation amis pour faire apparaitre petite pastille
