
import type { UserFriendState, UserGameState } from '@shared/types/users.ts';
import { handleInDashboard, removeDiv } from './utilsHandlers.ts';
import { friendsStore } from '../store/friendsStore.ts';
import { inviteStore } from '../store/inviteStore.ts';
import { renderOneFriend, updateButtonGameState } from '../components/friends/render.ts';
import { populateChatFriends } from '../components/chat/render.ts';
import { populateConnectedUsers } from '../components/chat/renderChatHub.ts';
import { renderOneUser } from '../components/home/online/render.ts';
import { updateUserButton } from '../components/home/online/utils.ts';
import { matchService } from '../services/match.ts';

function handleAcceptedInDashboard() {
	handleInDashboard();
}

async function handleAcceptedInFriends(data: any) {
	removeDiv(data.username, 'user-item');

	const user = friendsStore.getUser(data.username);
	if (!user)
		return;
	const friend: UserFriendState = {
		username: user.username,
		link_avatar: user.link_avatar,
		elo: user.elo,
		online: data.online ? true : false,
	}

	friendsStore.unsubscribe(data.username);
	friendsStore.removeUser(data.username);
	friendsStore.addFriend(friend);

	const gameState: any = await matchService.getInvitationStatus(data.username);
	const friendGameState: UserGameState = {
		username: friend.username,
		link_avatar: friend.link_avatar,
		online: true,
		elo: friend.elo,
		friend: true,
		invite: gameState.invite,
		matchId: gameState.invite === 'accepted' ? gameState.matchId : undefined
	}

	inviteStore.addFriend(friendGameState);
	inviteStore.subscribe(data.username, updateButtonGameState);

	const list = document.getElementById('friends-list') as HTMLElement;
	list?.insertAdjacentHTML('afterbegin', renderOneFriend(friendGameState));
}

async  function handleAcceptedInChat() {
	await populateChatFriends();

	const connectedList = document.getElementById('general-div');
	const connectedDiv = connectedList?.querySelector(`.connected-user`);
	if (connectedDiv)
		await populateConnectedUsers();
}

function handleAcceptedInOnline(data: any) {
	removeDiv(data.username, 'user-item');

	const user = inviteStore.getUser(data.username);
	if (!user)
		return;
	const friend: UserGameState = {
		username: user.username,
		link_avatar: user.link_avatar,
		online: true,
		elo: user.elo,
		friend: true,
		invite: user.invite,
		matchId: user.invite === 'accepted' ? user.matchId : undefined
	}
	const list = document.getElementById('online-friends') as HTMLElement;
	list.insertAdjacentHTML('beforeend', renderOneUser(friend));
	inviteStore.unsubscribe(data.username);
	inviteStore.removeUser(data.username);
	inviteStore.addFriend(friend);
	inviteStore.subscribe(friend.username, updateUserButton)
}

export const acceptedFriendHandlers = {
	dashboard: handleAcceptedInDashboard,
	friends: handleAcceptedInFriends,
	chat: handleAcceptedInChat,
	online: handleAcceptedInOnline,
};
