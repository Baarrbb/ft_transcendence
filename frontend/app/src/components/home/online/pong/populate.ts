
import { renderPong } from '../../pong/renderPongCanva.ts'
import { renderWaitingOverlay } from './render.ts';
import { sendPaddleMovement } from './movements.ts';
import { setupListenersPaddle } from './listeners.ts';

export function initPong(player1: string, player2: string) {
	const main = document.getElementById('main-content') as HTMLElement;
	if (!main)
		return;
	main.innerHTML = renderPong(true);

	renderWaitingOverlay(player1, player2);
	const inputState = setupListenersPaddle();
	sendPaddleMovement(inputState);
}
