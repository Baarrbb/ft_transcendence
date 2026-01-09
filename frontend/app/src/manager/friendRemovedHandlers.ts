
import type { UserFriendState, UserGameState } from '@shared/types/users.ts';
import { handleInDashboard, removeDiv, handleInChat } from './utilsHandlers.ts';
import { friendsStore } from '../store/friendsStore.ts';
import { inviteStore } from '../store/inviteStore.ts';
import { renderOneUser as renderOneUserInFriends, updateButton } from '../components/friends/render.ts'
import { updateUserButton } from '../components/home/online/utils.ts';
import { renderOneUser as renderOneUserInOnline } from '../components/home/online/render.ts';

function handleRemovedInDashboard() {
	handleInDashboard();
}

function handleRemovedInFriends(data: any) {
	removeDiv(data.username, 'user-item');

	const friend = friendsStore.getFriend(data.username);
	if (!friend)
		return;
	const user: UserFriendState = {
		username: friend.username,
		link_avatar: friend.link_avatar,
		elo: friend.elo,
		invite: 'none',
		is_anon: friend.is_anon
	}
	if (!user.is_anon) {
		const list = document.getElementById('add-friend') as HTMLElement;
		list?.insertAdjacentHTML('afterbegin', renderOneUserInFriends(user));
		friendsStore.addUser(user);
		friendsStore.subscribe(data.username, updateButton);
	}

	friendsStore.removeFriend(data.username);

	inviteStore.unsubscribe(data.username);
	inviteStore.removeFriend(data.username);
}

async function handleRemovedInChat(data: any) {
	handleInChat(data.username);
}

function handleRemovedInOnline(data: any) {
	removeDiv(data.username, 'user-item');

	const friend = inviteStore.getFriend(data.username);
	if (!friend)
		return;
	const user: UserGameState = {
		username: friend.username,
		link_avatar: friend.link_avatar,
		online: true,
		elo: friend.elo,
		friend: false,
		invite: friend.invite,
		matchId: friend.invite === 'accepted' ? friend.matchId : undefined
	}
	const list = document.getElementById('online-users') as HTMLElement;
	list.insertAdjacentHTML('beforeend', renderOneUserInOnline(user));

	inviteStore.unsubscribe(data.username);
	inviteStore.removeFriend(data.username);
	inviteStore.addUser(user);
	inviteStore.subscribe(user.username, updateUserButton);
}

export const removedFriendHandlers = {
	dashboard: handleRemovedInDashboard,
	friends: handleRemovedInFriends,
	chat: handleRemovedInChat,
	online: handleRemovedInOnline,
};
