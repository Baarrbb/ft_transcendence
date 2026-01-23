
import type { BasicResponse, UserResponse } from '@shared/types/users.ts';
import { matchService } from '../../../services/match.ts';
import { usersService } from '../../../services/users.ts';
import { getSocketUser, getSocketMatch, manageSocketMatch } from '../../../socket.ts'
import { catchHttpError } from '../../../utils/catchError.ts';
import { initMatchHandlers } from './pong/handlers.ts'
import { initPong } from './pong/populate.ts';
import { setCurrentMatchId } from './pong/matchState.ts';
import { inviteStore } from '../../../store/inviteStore.ts';
import { navigateTo } from '../../../main.ts';
import { showNotification } from '../../../utils/notification.ts';

function actionClick(username: string, action: string | null, matchId: string | null) {
	if (!action)
		return;
	switch (action) {
		case 'chat':
			navigateTo('main', 'chat', undefined, undefined, username );
			break;
		case 'invite':
			sendGameInvite(username);
			break;
		case 'cancel':
			cancelGameInvite(username);
			break;
		case 'decline':
			declineGame(username);
			break;
		case 'accept':
			navigateTo('main', 'home', 'online');
			acceptGame(username);
			break;
		case 'join':
			navigateTo('main', 'home', 'online');
			if (matchId)
				joinRoom(username, matchId);
			break;
	}
}

function handleClick(e: Event) {
	const target = e.target as HTMLElement;
	// let realTarget = target;
	// if (realTarget.tagName === 'IMG' && realTarget.parentElement)
	// 	realTarget = realTarget.parentElement;
	const button = target.closest('button[data-action]');
	if (!button)
		return;

	const userItem = button.closest('.user-item') as HTMLElement;
	if (!userItem)
		return;
	const username = userItem.dataset.username as string;
	const action = button.getAttribute('data-action');
	const matchId = button.getAttribute('data-match');
	actionClick(username, action, matchId);
}


export function setupOnlineListeners() {
	['online-friends', 'online-users'].forEach(containerId => {
		const container = document.getElementById(containerId);
		if (!container)
			return;
		container.addEventListener('click', handleClick)
	})
}


export function setupListenersInvitationOverlay(fromUsername: string) {
	const acceptBtn = document.getElementById('accept-game');
	const declineBtn = document.getElementById('decline-game');
	if (!acceptBtn || !declineBtn)
		return;

	acceptBtn.replaceWith(acceptBtn.cloneNode(true));
	declineBtn.replaceWith(declineBtn.cloneNode(true));

	const newAcceptBtn = document.getElementById('accept-game');
	const newDeclineBtn = document.getElementById('decline-game');

	newAcceptBtn?.addEventListener('click', () => {
		navigateTo('main', 'home', 'online');
		acceptGame(fromUsername) 
	});
	newDeclineBtn?.addEventListener('click', () => declineGame(fromUsername));
}


function sendSocket(type: string, username: string) {
	// const socket = getSocketGame();
	const socket = getSocketUser()
	if (!socket)
		return;
	socket.send(JSON.stringify({
		type: type,
		username: username
	}))
}

export async function sendGameInvite(username: string) {
	try {
		const response: BasicResponse = await matchService.addInvitation(username);
		if (response.success) {
			inviteStore.updateInvite(username, 'sent', 'none');
			sendSocket('game:invite', username);
		}
		else {
			showNotification('This user is no longer available', 'error')
		}
	}
	catch (error) {
		catchHttpError('Online game error:', error);
	}
}

export async function cancelGameInvite(username: string) {
	try {
		const response: BasicResponse = await matchService.cancelInvitation(username);
		console.log(response);
		if (response.success)
			sendSocket('game:invite:remove', username);
	}
	catch (error) {
		catchHttpError('Online game error:', error);
	}
}

export async function declineGame(username: string) {
	try {
		console.log('dans declineGame')
		const response: BasicResponse = await matchService.declineInvitation(username);
		if (response.success)
			sendSocket('game:invite:remove', username);
		console.log("ca fail??", response.success)
	}
	catch (error) {
		catchHttpError('Online game error:', error);
	}
}




export async function acceptGame(username: string) {
	const response: any = await matchService.acceptInvitation(username);
	if (response.success && response.username && response.matchId) {
		// const socketGame = getSocketGame();
		const socketGame = getSocketUser();
		socketGame?.send(JSON.stringify({
			type: "game:accept",
			username: username,
			matchId: response.matchId
		}));
		setCurrentMatchId(response.matchId);
		console.log('setCurrentMatchId:', response.matchId);
		
		manageSocketMatch('on', response.matchId, () => {
			console.log("ouverture socket player:in:", response.matchId)
			const socketMatch = getSocketMatch(response.matchId);
			socketMatch?.send(JSON.stringify({
				type: "player:in"
			}));
			initMatchHandlers(response.matchId, true);
		})
		initPong(username, response.username);
	}
}

export async function joinRoom(username: string, matchId: string) {
	const myInfo: UserResponse = await usersService.userInfo();
	if (myInfo.success && myInfo.user && myInfo.user.username) {
		setCurrentMatchId(matchId);
		console.log('setCurrentMatchId:', matchId);
		initPong(username, myInfo.user.username);

		const socketMatch = getSocketMatch(matchId);
		socketMatch?.send(JSON.stringify({
			type: "player:in"
		}));
	}
}
