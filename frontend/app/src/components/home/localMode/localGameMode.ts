
import { renderCard } from '../home.ts';
import { start } from './play1v1.ts';

export function renderLocalGame(): string {
	return /*ts*/`
		<div class="relative h-screen w-full p-4 overflow-hidden">
			<div class="absolute top-0 left-0 w-full text-center pt-6 z-10">
				<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 relative">
					<span class="relative z-10">Pong Arena</span>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</h2>
			</div>
		
			<div class="flex h-screen items-center justify-center gap-6">

				${renderCard("1v1 together", "/wallpaper/1v1together.gif", "local-duo")}
				${renderCard("1v1 Bot", "/wallpaper/15vers.gif", "local-bot")}

			</div>
		</div>
	`
}

export function setupListenersLocalGame() {
	const duoDiv = document.getElementById('local-duo');
	const botDiv = document.getElementById('local-bot');

	duoDiv?.addEventListener('click', () => { start("Player 1", "Player 2"); })
	botDiv?.addEventListener('click', () => { start("Player 1", "BOT", true) })
}
