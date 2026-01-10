
import { navigateTo } from '../../main.ts';

function renderTitle(text: string): string {
	return /*ts*/`
		<div class="flex-shrink-0 px-4 py-3 border-b border-[var(--color-primary)]/30">
			<h3 class="text-lg font-display uppercase tracking-wide text-[var(--color-primary-light)] text-center relative">
				<span class="relative z-10 backdrop-blur-sm px-2">
					${text}
				</span>
				<div class="absolute inset-0 flex items-center">
					<div class="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</div>
			</h3>
		</div>
	`
}

function renderImg(src: string): string {
	return /*ts*/`
		<div class="flex-1 overflow-hidden">
			<img 
				src="${src}" 
				alt="background" 
				class="w-full h-full object-cover transition-all duration-500 blur-sm opacity-80 hover:blur-none hover:opacity-100"
			/>
		</div>
	`
}

export function renderCard(title: string, srcImg: string, id: string): string {
	return /*ts*/`
		<div id="${id}"
			class="cursor-pointer flex flex-col text-[#d4ced4] h-[260px] w-[320px] bg-[#02010f]/80 backdrop-blur-sm border border-[var(--color-primary)] overflow-hidden rounded-2xl shadow-xl transition-transform duration-200 hover:scale-105">
			${renderTitle(title)}
			${renderImg(srcImg)}
		</div>
	`
}

export function renderHome(): string {
	return /*ts*/`
		<div class="relative h-screen w-full p-4 overflow-hidden">
			<div class="absolute top-0 left-0 w-full text-center pt-6 z-10">
				<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 relative">
					<span class="relative z-10">Pong Arena</span>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</h2>
			</div>
		
			<div class="flex h-screen items-center justify-center gap-6">

				${renderCard("1v1 local", "/wallpaper/1v1_together.gif", "local-div")}
				${renderCard("tournament", "/wallpaper/dune_tour.gif", "tournament-div")}
				${renderCard("1v1 online", "/wallpaper/dune_call.gif", "online-div")}

			</div>
		</div>
	`;
}

export function setupListenersHome() {
	const localDiv = document.getElementById('local-div');
	const tournamentDiv = document.getElementById('tournament-div');
	const onlineDiv = document.getElementById('online-div');

	localDiv?.addEventListener('click', () => {
		navigateTo('main', 'home', 'local');
	})
	tournamentDiv?.addEventListener('click', () => {
		navigateTo('main', 'home', 'tournament');
	})
	onlineDiv?.addEventListener('click', () => {
		navigateTo('main', 'home', 'online');
	})
}
