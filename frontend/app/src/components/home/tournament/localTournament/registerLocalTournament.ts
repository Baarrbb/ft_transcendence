

import type { Tournament } from "../../pongLocal/localGameType.ts";
import { renderMatchesTournament, setupListenersPlayMatch } from './renderLocalTournament.ts';
import { initTournament } from './initTournament.ts';

let currentTournament: Tournament | null = null;

function renderPlayerSlot(i: number): string {
	return /*ts*/`
		<div class="player-slot relative border-2 border-dashed border-gray-400 rounded-lg p-4 text-center flex flex-col items-center justify-center h-24">
			<span class="slot-label text-gray-400">Joueur ${i}</span>
			<input type="text" class="hidden text-white w-full mt-2 px-2 py-1 border rounded" placeholder="Player name" maxlength="12" />
			<button class="cursor-pointer join-btn mt-2 px-3 py-1 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-light)] transition-all duration-300">Register</button>
		</div>
	`;
}

export function renderRegisterLocalTournament(): string {
	return /*ts*/ `
		<div class="flex flex-col h-screen w-full p-4">
			<div class="w-full text-center pt-6 flex-shrink-0">
				<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 relative">
					<span class="relative z-10">Pong Arena</span>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</h2>
			</div>
		
			<div class="flex-1 overflow-y-auto w-full flex flex-col items-center gap-6 justify-start lg:justify-center">
				<div id="player-slots" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl px-2">
					${[1,2,3,4,5,6,7,8].map(i => renderPlayerSlot(i)).join('')}
				</div>
			</div>

			<div class="w-full flex justify-center flex-shrink-0 mt-4 px-2">
				<button id="start-tournament" class="px-6 py-3 bg-green-600 text-white rounded disabled:opacity-50 w-full sm:w-auto" disabled>
					Start tournament
				</button>
			</div>
		</div>
	`;
}

export function setupListenersRegisterTournament() {

	const slots = document.querySelectorAll('.player-slot');
	const startBtn = document.getElementById('start-tournament') as HTMLButtonElement;
	let players: string[] = [];

	// startBtn.disabled = true;

	slots.forEach(slot => {
		const joinBtn = slot.querySelector('.join-btn') as HTMLButtonElement;
		const input = slot.querySelector('input') as HTMLInputElement;
		const label = slot.querySelector('.slot-label') as HTMLSpanElement;

		joinBtn.addEventListener('click', () => {
			if (input.classList.contains('hidden')) {
				input.classList.remove('hidden');
				input.focus();
				label.classList.add('hidden');
			} else if (input.value.trim() !== '') {
				for (let i = 0; i < players.length; i++) {
					if (input.value.trim() === players[i]) {
						input.classList.add('border-red-500');
						return;
					}
				}
				joinBtn.remove();
				input.remove();
				label.classList.remove('hidden');
				label.classList.add('text-white');
				label.innerHTML = input.value.trim();
				slot.classList.add('justify-center');
				// faire affichage sur navigateur
				
				players.push(input.value.trim());
				checkPlayers();
			}
		});
	});

	function checkPlayers() {
		const registered = Array.from(slots).filter(slot => {
			const label = slot.querySelector('.slot-label') as HTMLSpanElement;
			return label && label.classList.contains('text-white');
		}).length;

		startBtn.disabled = !(registered >= 4 && registered <= 8 && registered % 2 === 0);
		startBtn.classList.toggle('cursor-pointer', !startBtn.disabled);
	}

	startBtn.addEventListener('click', () => {
		if (startBtn.disabled)
			return;
		const main = document.getElementById('main-content') as HTMLElement;
		if (main) {
			currentTournament = initTournament(players);
			if (!currentTournament)
				return;
			setTimeout(() => setupListenersPlayMatch(currentTournament!), 0);
			main.innerHTML = renderMatchesTournament(currentTournament);
		}
	});
}

