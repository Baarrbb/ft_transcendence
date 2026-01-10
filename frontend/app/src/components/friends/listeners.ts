
import type { BasicResponse } from '@shared/types/users.ts';
import { catchHttpError } from '../../utils/catchError.ts';
import { getSocketUser } from '../../socket.ts'
import { showNotification } from '../../utils/notification.ts';
import { showUserStats } from '../profil/showStats.ts';
import { friendsService } from '../../services/friends.ts'
import { blockUsersService } from '../../services/blockUsers.ts'
import { friendsStore } from '../../store/friendsStore.ts';

import { sendGameInvite } from '../home/online/listeners.ts';
import { inviteStore } from '../../store/inviteStore.ts';
import { navigateTo } from '../../main.ts';


async function actionClick(username: string, action: string | null) {
	if (!action)
		return;
	switch (action) {
		case 'chat':
			navigateTo('main', 'chat', undefined, undefined, username);
			break;
		case 'block':
			await blockUser(username);
			break;
		case 'add':
			addFriend(username);
			break;
		case 'accept':
			acceptFriend(username);
			break;
		case 'decline':
			declineFriend(username);
			break;
		case 'remove':
			removeFriend(username);
			break;
		case 'show':
			await showUserStats(username);
			break;
		case 'invite':
			sendGameInvite(username);
			break;
	}
}

async function handleClick(e: Event) {
	const target = e.target as HTMLElement;
	const actionElement = target.closest<HTMLElement>('[data-action]');
	if (!actionElement)
		return;
	const action = actionElement.getAttribute('data-action');

	const userItem = actionElement.closest('.user-item') as HTMLElement;
	if (!userItem)
		return;
	const username = userItem.dataset.username as string;
	if (!username)
		return;

	actionClick(username, action);
}

export function setupListenersFriends() {
	['add-friend', 'friends-list'].forEach(containerId => {
		const container = document.getElementById(containerId);
		if (!container)
			return;
		container.addEventListener('click', handleClick)
	})
}

function sendSocket(type: string, username: string) {
	const socket = getSocketUser();
	socket?.send(JSON.stringify({
		type: type,
		username: username
	}))
}


async function blockUser(username: string) {
	try {
		const response: BasicResponse = await blockUsersService.blockUser(username);
		if (response.success) {
			const userDiv = document.querySelector(`.user-item[data-username=${username}]`);
			if (!userDiv)
				return ;
			userDiv.remove();

			friendsStore.unsubscribe(username);
			friendsStore.removeFriend(username);
			friendsStore.removeUser(username);

			inviteStore.unsubscribe(username);
			inviteStore.removeFriend(username);

			sendSocket('block', username);
		}
		else
			showNotification(response.message, 'error');
	}
	catch (error) {
		catchHttpError('Friends add error:', error);
	}
}

async function addFriend(username: string) {
	try {
		const response: BasicResponse = await friendsService.addFriend(username);
		if (response.success) {
			friendsStore.updateInvite(username, 'sent', 'none');
			sendSocket('friend:request', username);
		}
		else
			showNotification(response.message, 'error');
	}
	catch (error) {
		catchHttpError('Friends add error:', error);
	}
}

async function acceptFriend(username: string) {
	try {
		const response: BasicResponse = await friendsService.acceptFriend(username);
		if (response.success)
			sendSocket('friend:request:accept', username);
		else
			showNotification(response.message, 'error');
	}
	catch (error) {
		catchHttpError('Friends add error:', error);
	}
}

async function declineFriend(username: string) {
	try {
		const response: BasicResponse = await friendsService.declineFriend(username);
		if (response.success) {
			friendsStore.updateInvite(username, 'none', 'received');
			sendSocket('friend:request:decline', username);
		}
		else
			showNotification(response.message, 'error');
	}
	catch (error) {
		catchHttpError('Friends add error:', error);
	}
}

async function removeFriend(username: string) {
	try {
		const response: BasicResponse = await friendsService.removeFriend(username);
		if (response.success)
			sendSocket('friend:remove', username);
		else
			showNotification(response.message, 'error');
	}
	catch (error) {
		catchHttpError('Friends add error:', error);
	}
}

