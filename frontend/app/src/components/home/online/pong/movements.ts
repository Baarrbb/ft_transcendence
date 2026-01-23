
import { setPongInterval } from './matchState.ts';
import { getSocketMatch } from '../../../../socket.ts';
import { getCurrentMatchId } from './matchState.ts';


export function sendPaddleMovement(inputState: { upPressed: boolean, downPressed: boolean }) {
	const pongInterval = setInterval(() => {
		// if (!inputState.upPressed && !inputState.downPressed)
		// 	return;
		let direction = 0;
		if (inputState.upPressed)
			direction = -1;
		else if (inputState.downPressed)
			direction = 1;
		// direction = inputState.upPressed ? -1 : 1;
		const matchId = getCurrentMatchId();
		if (matchId) {
			const socketMatch = getSocketMatch(matchId);
			if (socketMatch && socketMatch.readyState === WebSocket.OPEN) {
				socketMatch?.send(JSON.stringify({
					type: 'player:move',
					direction
				}));
			}
		}
	}, 50);
	setPongInterval(pongInterval);
}
