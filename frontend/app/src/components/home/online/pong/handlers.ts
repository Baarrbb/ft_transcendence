
import { setActiveMatchHandlers } from '../../../../socketManager.ts';
import { drawGame, renderWinnerOverlay } from './render.ts';
import { updatePlayerStatus, updateScore, checkPlayerReady } from './utils.ts';
import { showNotification } from './utils.ts';
import { cleanupOnlinePong } from './clean.ts';
import { getCurrentMatchId } from './matchState.ts';

let roomUpdateHandler: ((data: any) => void) | null = null;
let playersInRoomHandler: ((data: any) => void) | null = null;
let playerReadyHandler: ((data: any) => void) | null = null;
let gameUpdateHandler: ((data: any) => void) | null = null;
let gameCountdownHandler: ((data: any) => void) | null = null;
let endGameHandler: ((data: any) => void) | null = null;

let timeToJoinHandler: ((data: any) => void) | null = null;
let timeExceededHandler: ((data: any) => void) | null = null;

let playerLeftHandler: ((data: any) => void) | null = null;


export function initMatchHandlers(matchId: string, inRoom: boolean) {
	roomUpdateHandler = (data: any) => handleRoomUpdate(data);
	playersInRoomHandler = (data: any) => handlePlayersInRoom(data);
	playerReadyHandler = (data: any) => handlePlayerReady(data);
	gameUpdateHandler = (data: any) => handleGameUpdate(data);
	gameCountdownHandler = (data: any) => handleGameCountdown(data);
	endGameHandler = (data: any) => handleEndGame(data);

	timeToJoinHandler = (data: any) => handleCountdown(data, inRoom);
	timeExceededHandler = (data: any) => handleTimeExceeded(data);

	playerLeftHandler = handlePlayerLeft;


	setActiveMatchHandlers(matchId, [
		roomUpdateHandler,
		playersInRoomHandler,
		playerReadyHandler,
		gameUpdateHandler,
		gameCountdownHandler,
		endGameHandler,

		timeToJoinHandler,
		timeExceededHandler,

		playerLeftHandler
	])
}



function handleRoomUpdate(data: any) {
	if (data.type !== 'room:update')
		return;
	if (data.match.matchId !== getCurrentMatchId())
		return;

	const overlay = document.getElementById('pong-overlay');
	if (!overlay)
		return;

	updatePlayerStatus(data.player1);
	updatePlayerStatus(data.player2);
	checkPlayerReady(data.player1);
	checkPlayerReady(data.player2);

	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (!canvas)
		return;

	const parent = canvas.parentElement!;
	const maxWidth = parent.clientWidth;
	const maxHeight = parent.clientHeight;
	let canvasWidth = maxWidth;
	let canvasHeight = maxWidth * 9 / 16;
	if (canvasHeight > maxHeight) {
		canvasHeight = maxHeight;
		canvasWidth = maxHeight * 16 / 9;
	}
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	drawGame(canvas, data.match);
}

function handlePlayersInRoom(data: any) {
	if (data.type !== 'game:ready')
		return;
	if (data.match.matchId !== getCurrentMatchId())
		return;

	const overlay = document.getElementById('pong-overlay');
	if (overlay) {
		const countdown = document.getElementById('countdown');
		if (!countdown)
			return;
		countdown.classList.add('hidden');
	}

	const notifCountdown = document.getElementById('join-party-countdown');
	if (notifCountdown)
		notifCountdown.remove();

}

function handlePlayerReady(data: any) {
	if (data.type !== 'player:ready')
		return;
	if (data.match.matchId !== getCurrentMatchId())
		return;

	const overlay = document.getElementById('pong-overlay');
	if (!overlay)
		return;
	const player = document.getElementById(`${data.username}-ready`) as HTMLElement;
	if (!player)
		return;
	player.innerHTML = `${data.username} ready`;
	player.classList.remove('opacity-60')
	player.classList.add('opacity-100', 'bg-[var(--color-primary-light)]/20', 'shadow-lg');
}

function handleGameUpdate(data: any) {
	if (data.type !== 'game:update')
		return;
	if (data.match.matchId !== getCurrentMatchId())
		return;

	if (data.match.running) {
		const overlay = document.getElementById('pong-overlay');
		if (!overlay)
			return;
		overlay.style.display = 'none';
	}

	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (!canvas)
		return;
	updateScore(data.match)
	drawGame(canvas, data.match);
}

function handleGameCountdown(data: any) {
	if (data.type !== 'game:countdown')
		return;
	if (data.match.matchId !== getCurrentMatchId())
		return;

	const overlay = document.getElementById('pong-overlay');
	if (!overlay)
		return;
	const countdown = document.getElementById('countdown') as HTMLElement;
	if (!countdown)
		return;
	countdown.style.display = 'flex';
	countdown.textContent = `${data.seconds}`;
	if (data.seconds === 0)
		overlay.style.display = 'none';
}

function handleEndGame(data: any) {
	if (data.type !== 'game:winner' && data.type !== 'game:loser')
		return;
	if (data.match.matchId !== getCurrentMatchId())
		return;

	// renderWinnerOverlay("You WIN!", data.loser);
	// renderWinnerOverlay("You LOSE!", data.winner);
	if (data.type === 'game:winner')
		renderWinnerOverlay("You WIN!");
	else
		renderWinnerOverlay("You LOSE!");
}


function handleCountdown(data: any, inRoom: boolean) {
	if (data.type !== 'player:waiting')
		return ;

	console.log(inRoom);

	if (inRoom) {
		const countdown = document.getElementById('countdown') as HTMLElement;
		if (!countdown)
			return;
		countdown.textContent = `${data.seconds}`;
	}
	else {
		showNotification(`Time left to join ${data.inRoom}: `, true, data.seconds);
		const span = document.getElementById(`time-left-${data.inRoom}`) as HTMLElement;
		if (!span)
			return;
		span.innerHTML = `${data.seconds}`;
	}
}

import { inviteStore } from '../../../../store/inviteStore.ts';

function handleTimeExceeded(data: any) {
	if (data.type !== 'game:expired')
		return;

	console.log('game:expired')
	console.log('current:', getCurrentMatchId())
	console.log('data matchid:', data.match.matchId)
	console.log('data :', data);

	const overlay = document.getElementById('pong-overlay');
	if (data.match.matchId === getCurrentMatchId() && overlay) {
		console.log('dans meme match id')
		const countdown = document.getElementById('countdown');
		if (countdown)
			countdown.classList.add('hidden');
		const alone = document.getElementById('alone');
		if (!alone)
			return;
		alone.style.display = 'flex';
		alone.textContent = 'Time exceeded. Game canceled';
		cleanupOnlinePong();
	}
	else if (!overlay) {
		console.log('pas de match id et pas doverlay')
		const invitation = document.getElementById('accepted-invitation-overlay');
		if (invitation)
			invitation.remove();
		const notifCountdown = document.getElementById('join-party-countdown');
		if (notifCountdown)
			notifCountdown.remove();
		showNotification("Time exceeded", false);

		// const divUser = document.querySelector(`.user-item[data-username=${data.username}]`)
		// if (divUser) {
		// 	const btn = divUser.querySelector('[data-action=join]')
		// 	if (btn)
		// 		btn.replaceWith(stringToElement(renderSendInvite()));
		// }
		inviteStore.updateInvite(data.username, 'none', 'accepted');
		// inviteStore.updateInvite(data.username, 'none', 'received');

		cleanupOnlinePong();
	}
}

// import { renderInviteGame } from '../../chat/render.ts';
// import { initGameBtn } from '../../chat/listeners.ts';

export async function handlePlayerLeft(data: any) {
	if (data.type !== 'player:left')
		return;
	console.log('player:left');
	console.log('current:', getCurrentMatchId())
	console.log('data matchid:', data.match.matchId)

	inviteStore.updateInvite(data.usernameExit, 'none', 'accepted');
	inviteStore.updateInvite(data.usernameExit, 'none', 'received');
	// const divUser = document.querySelector(`.user-item[data-username=${data.usernameExit}]`)
	// if (divUser) {
	// 	const btn = divUser.querySelector('[data-action=join]')
	// 	if (btn)
	// 		btn.replaceWith(stringToElement(renderSendInvite()));
	// }
	const inviteOverlay = document.getElementById('accepted-invitation-overlay');
	if (inviteOverlay)
		inviteOverlay.remove();

	if (data.match.matchId !== getCurrentMatchId()) {
		showNotification(`${data.usernameExit} left !`, false);
		return;
	}

	if (document.getElementById('pong-overlay')) {
		const player: any = {
			username: data.usernameExit,
			inRoom: false
		}
		updatePlayerStatus(player);
	}

	if (data.running)
		renderWinnerOverlay("You WIN!")
		// renderWinnerOverlay("You WIN!", data.usernameExit)
	showNotification(`${data.usernameExit} left !`, false);
	
	cleanupOnlinePong();
}
