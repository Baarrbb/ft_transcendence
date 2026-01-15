
import { draw, renderWinnerOverlay, cleanupOverlay, resizeListeners, cleanResizeHandler } from '../pongLocal/render.ts'
import { renderPong } from '../pong/renderPongCanva.ts'
import { initGame, waitPlayers, setupListenersGame1v1, cleanupListeners, cleanCountDown } from '../pongLocal/game.ts'

let pongInterval: number | undefined = undefined;

export function start(p1: string, p2: string, isBot: boolean = false) {
	cleanupPong();

	const main = document.getElementById('main-content') as HTMLElement;
	if (main) {
		main.innerHTML = renderPong();
		const game = initGame(p1, p2, false, isBot);
		resizeListeners(game!);

		if (isBot)
			game!.playersReady.player2 = true;

		setupListenersGame1v1(game!);
		waitPlayers(game!, p1, p2);


		// setTimeout(() => {
			pongInterval = window.setInterval(() => { 
				console.log('icic intergval de draw', pongInterval);
				draw(game!);
				if (game && game.winner) {
					cleanupPong();
					renderWinnerOverlay(game, false);
				}
			}, 10);
		// }, 0);
	}
}

function clearPongInterval() {
	if (pongInterval !== undefined) {
		clearInterval(pongInterval);
		pongInterval = undefined;
	}
}

export function cleanupPong() {
	// const canvas = document.getElementById('pong-canvas')
	// if (!canvas)
	// 	return;
	console.log('clearPinr')
	clearPongInterval();
	cleanCountDown();
	cleanupListeners();
	cleanResizeHandler();
	cleanupOverlay();
}
