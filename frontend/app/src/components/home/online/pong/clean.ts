
import { cleanupPaddlesListeners } from './listeners.ts';

function cleanupListeners() {
	cleanupPaddlesListeners();
	// cleanupPauseListener();
}

import { getPongInterval, setPongInterval } from './matchState.ts';

function clearPongInterval() {
	if (getPongInterval() !== undefined) {
		clearInterval(getPongInterval());
		setPongInterval(undefined);
	}
}

import { getCurrentMatchId, setCurrentMatchId } from './matchState.ts';
import { clearMatchHandlers } from '../../../../socketManager.ts';
import { getSocketMatch, manageSocketMatch } from '../../../../socket.ts';

// enlever apl fct de changeview et mettre dans player left ?
export function cleanupOnlinePong() {
	clearPongInterval();
	cleanupListeners();
	console.log('je pars');
	const currentMatchId = getCurrentMatchId();
	if (currentMatchId) {
		clearMatchHandlers(currentMatchId);
		const socketMatch = getSocketMatch(currentMatchId);
		socketMatch?.send(JSON.stringify({
			type: 'player:exit',
		}));
		console.log("fermeture socket:", currentMatchId);
		manageSocketMatch('off', currentMatchId);
		setCurrentMatchId(null);
	}
}
