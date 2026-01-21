
import type { Tournament, TournamentMatch, LocalGame } from "../../pongLocal/localGameType.ts";
import { draw, renderWinnerOverlay, cleanupOverlay, resizeListeners, cleanResizeHandler } from '../../pongLocal/render.ts'
import { initGame, waitPlayers, setupListenersGame1v1, cleanupListeners, cleanCountDown } from '../../pongLocal/game.ts'
import { renderPong } from '../../pong/renderPongCanva.ts';
import { renderTournamentWinner } from './renderLocalTournament.ts';

let pongInterval: number | undefined = undefined;

function waitForMatchEnd(game: LocalGame): Promise<LocalGame> {
	return new Promise(resolve => {
		pongInterval = window.setInterval(() => {
			console.log('icic intergval de draw', pongInterval);
			draw(game);
			if (game && game.winner) {
				resolve(game);
			}
		}, 10);
	});
}

export async function startMatch(tournmt: Tournament, round: number, idMatch: number): Promise<LocalGame | undefined> {
	cleanupPongMatch();
	const match: TournamentMatch = tournmt.rounds[Number(round)].matches[Number(idMatch)];
	const main = document.getElementById('main-content') as HTMLElement | null;
	if (!main)
		return match.game;

	main.innerHTML = renderPong();
	match.game = initGame(match.p1, match.p2, true, false);
	resizeListeners(match.game!);
	setupListenersGame1v1(match.game!);
	waitPlayers(match.game!, match.p1, match.p2);

	match.game = await waitForMatchEnd(match.game!);

	cleanupPongMatch();
	if (round < tournmt.nbRound - 1)
		renderWinnerOverlay(match.game, true, tournmt);
	else
		renderTournamentWinner(tournmt, match.game?.winner!);
	return match.game;
}

function clearPongInterval() {
	if (pongInterval !== undefined) {
		clearInterval(pongInterval);
		pongInterval = undefined;
	}
}

export function cleanupPongMatch() {
	// const canvas = document.getElementById('pong-canvas')
	// if (!canvas)
	// 	return;
	console.log('clearPingTroun')
	clearPongInterval();
	cleanCountDown();
	cleanupListeners();
	cleanResizeHandler();
	cleanupOverlay();
}
