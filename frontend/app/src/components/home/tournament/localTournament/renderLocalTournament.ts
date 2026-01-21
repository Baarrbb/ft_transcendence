
import type { Tournament, TournamentMatch, TournamentRound } from "../../pongLocal/localGameType.ts";
import { startMatch } from './playMatch.ts';

export function renderMatchesTournament(tournmt: Tournament): string {
	return /*ts*/`
		<div class="relative h-screen w-full p-4 overflow-hidden">
			<div class="absolute top-0 left-0 w-full text-center pt-6 z-10">
				<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 relative">
					<span class="relative z-10">Matches</span>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</h2>
			</div>
		
			<div class="flex flex-col items-center justify-center h-full gap-6">
				${renderMatches(tournmt)}
			</div>
		</div>
	`;
}

function isMatchPlayable(m: TournamentMatch): boolean {
	return ( m.status === 'waiting' && m.p1 !== '' && m.p2 !== '' && m.p1 !== 'Bye' && m.p2 !== 'Bye' );
}

function renderMatches(tournmt: Tournament): string {
	const activeRoundIdx = tournmt.rounds.findIndex(round => round.matches.some(m => isMatchPlayable(m)) );

	const roundsHtml = tournmt.rounds.map((rnd, rndIdx) => {
		const matchesHtml = rnd.matches.map(m => {

			const showPlay = rndIdx === activeRoundIdx && isMatchPlayable(m);
			const p1IsLoser: boolean = isLoser(m, m.p1);
			const p2IsLoser: boolean = isLoser(m, m.p2);
			const p1Score = getPlayerScore(m, 0);
			const p2Score = getPlayerScore(m, 1);
			const p1 = renderPlayerName(tournmt.rounds[rndIdx - 1], m.matchIdx, 0, m.p1, p1IsLoser, p1Score);
			const p2 = renderPlayerName(tournmt.rounds[rndIdx - 1], m.matchIdx, 1, m.p2, p2IsLoser, p2Score);

			const isFinalRound = rndIdx === tournmt.rounds.length - 1;
			const isFinalMatch = isFinalRound && rnd.matches.length === 1;

			return /*ts*/`
				<div class="w-full flex mb-4 p-3 bg-gray-800/60 rounded text-white justify-center items-center">
					<div class="w-full flex flex-col">
						<div class="player-1 p-2 mb-1 w-full text-md font-bold border border-[var(--color-primary)] bg-[#111827] rounded-sm text-center">
							${p1}
						</div>
						<div class="player-2 p-2 w-full text-md font-bold border border-[var(--color-primary)] bg-[#111827] rounded-sm text-center">
							${p2}
						</div>
					</div>

					${showPlay ? `<button class="play-match cursor-pointer bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-black font-bold px-3 py-1 rounded"
							data-round="${rndIdx}" data-match="${m.matchIdx}">
							${isFinalMatch ? 'Play Final' : 'Play'}
						</button>`
						: ''}
				</div>
			`;
		}).join('');

		return /*ts*/`
			<div class="w-[20%] flex flex-col">
				<div class="w-full h-full flex flex-col px-4 items-center justify-around">
					${matchesHtml}
				</div>
			</div>
		`;
	}).join('');

	return /*ts*/`
		<div id='rounds-tournament' class="w-full justify-center flex gap-4 overflow-y-auto">
			${roundsHtml}
		</div>
	`;
}

function renderPlayerName( prevRound: TournamentRound, matchIdx: number, slot: 0 | 1, player: string, isLoser: boolean, score: number | null ): string {
	if (player && player !== 'Bye') {
		return /*ts*/`
			<div class="flex justify-between items-center">
				<span class="${isLoser ? 'text-gray-600' : ''}">
					${player}
				</span>
				${score !== null
					? `<span class="ml-4 font-mono text-[var(--color-primary)]">${score}</span>`
					: ''
				}
			</div>
		`;
	}
	else if (player && player === 'Bye') {
		return /*ts*/`
			<span class="font-normal italic text-gray-200">
				${player}
			</span>
		`;
	}

	const sourceIdx = matchIdx * 2 + slot;
	const sourceMatch = prevRound.matches[sourceIdx];

	if (!sourceMatch)
		return '';

	return /*ts*/`
		<span class="text-gray-400">
			Winner match ${sourceMatch.matchIdGlobal}
		</span>
	`;
}

function isLoser(match: TournamentMatch, player: string): boolean {
	if (match.status !== 'finished' || !match.game?.winner)
		return false;

	return player !== match.game.winner;
}

function getPlayerScore( match: TournamentMatch, slot: 0 | 1 ): number | null {
	if (match.status !== 'finished' || !match.game)
		return null;

	return slot === 0 ? match.game.score.left : match.game.score.right;
}


export function setupListenersPlayMatch(tournmt: Tournament) {
	const container = document.getElementById('rounds-tournament');

	container?.addEventListener('click', async (e) => {
		const target = e.target as HTMLElement;
		const btn = target.closest('.play-match') as HTMLElement | null;
		if (!btn)
			return;
		const round = btn.dataset.round;
		const idMatch = btn.dataset.match;
		if (round === undefined || idMatch === undefined)
			return;

		btn.setAttribute('disabled', 'true');

		const match = tournmt.rounds[Number(round)].matches[Number(idMatch)];
		match.game = await startMatch(tournmt, Number(round), Number(idMatch));
		match.status = 'finished';

		if (Number(round) < tournmt.nbRound - 1) {
			const targetMatch = tournmt.rounds[Number(round) + 1].matches[Math.floor(Number(idMatch) / 2)];
			if (Number(idMatch) % 2 === 0)
				targetMatch.p1 = match.game?.winner!;
			else
				targetMatch.p2 = match.game?.winner!;
		}

		console.log('match finished:', match.game);
		console.log('tournament state:', tournmt);
	});
}




import { navigateTo } from '../../../../main.ts';

export function renderTournamentWinner(tournmt: Tournament, winner: string) {
	const overlay = document.getElementById('pong-overlay') as HTMLElement;
	if (!overlay)
		return;
	overlay.innerHTML = '';
	overlay.style.display = 'flex';
	overlay.classList.add('gap-[2rem]', 'justify-center', 'items-center');

	const winnerText = document.createElement('div');
	winnerText.innerText = winner + " CHAMPION!";
	winnerText.className = 'flex flex-col items-center text-[5rem] text-[var(--color-primary-light)] font-extrabold transform scale-0 transition-transform duration-500 ease-out';

	const details = document.createElement('div');
	details.className = 'text-gray-600 text-[2rem] text-center';
	details.innerText = winner + ' wins the tournament !';
	winnerText.appendChild(details);

	overlay.appendChild(winnerText);

	const buttonsContainer = document.createElement('div');
	buttonsContainer.classList.add('flex', 'gap-4');

	const createButton = (text: string, onClick: () => void) => {
		const btn = document.createElement('button');
		btn.innerText = text;
		btn.classList.add('px-6', 'py-2', 'rounded-xl', 'font-bold', 'border', 'transition-colors', 'duration-200');
		btn.classList.add('border-[var(--color-primary)]', 'text-[var(--color-primary)]');
		btn.classList.add('hover:bg-[var(--color-primary)]', 'hover:text-[#02010f]', 'cursor-pointer');
		btn.onclick = onClick;
		return btn;
	};

	const backTournament = createButton('Back', () => {
		const main = document.getElementById('main-content') as HTMLElement | null;
		if (main) {
			setTimeout(() => setupListenersPlayMatch(tournmt), 0);
			main.innerHTML = renderMatchesTournament(tournmt);
		}
	});
	const backHome = createButton('Home', () => navigateTo('main', 'home') );

	buttonsContainer.appendChild(backTournament);
	buttonsContainer.appendChild(backHome);

	overlay.appendChild(buttonsContainer);

	setTimeout(() => {
		winnerText.classList.remove('scale-0');
		winnerText.classList.add('scale-100');
	}, 50);
}
