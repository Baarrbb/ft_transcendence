
import { navigateTo } from '../../../main.ts';
import { renderCard } from '../home.ts';

// ${renderCard("online", "/wallpaper/tourn_online.gif", "online-tournmt")}

export function renderTournmt(): string {
	return /*ts*/`
		<div class="relative h-screen w-full p-4 overflow-hidden">
			<div class="absolute top-0 left-0 w-full text-center pt-6 z-10">
				<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 relative">
					<span class="relative z-10">Pong Arena</span>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</h2>
			</div>
		
			<div class="flex h-screen items-center justify-center gap-6">

				${renderCard("local", "/wallpaper/tourn_local.gif", "local-tournmt")}

			</div>
		</div>
	`
}

export function setupListenersTournmt() {
	const localDiv = document.getElementById('local-tournmt');
	// const onlineDiv = document.getElementById('online-tournmt');

	localDiv?.addEventListener('click', () => {
		navigateTo('main', 'home', 'tournament', { mode: 'local' });
	});
	// onlineDiv?.addEventListener('click', () => {
	// 	navigateTo('main', 'home', 'tournament', { mode: 'online' });
	// });
}
