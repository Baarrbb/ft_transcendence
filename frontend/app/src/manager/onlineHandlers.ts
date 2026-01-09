
import type { UsersInfo } from '@shared/types/users.ts';
import { inviteStore } from '../store/inviteStore.ts';
import { friendsStore } from '../store/friendsStore.ts';
import { changeStatusColorOnline, setOnlineInOnline, changeStatusColorOffline, removeDiv } from './utilsHandlers.ts';
import { renderOneConnectedUser } from '../components/chat/renderChatHub.ts';

function handleStatusOfflineInFriends(data: any) {
	changeStatusColorOffline('user-item', data.username);

	const friend = friendsStore.getFriend(data.username);
	if (!friend)
		return;
	friend.online = false;
}

function handleStatusOfflineInChat(data: any) {
	changeStatusColorOffline('friend-chat', data.username);
	changeStatusColorOffline('chat-user-info', data.username);
	removeDiv(data.username, 'connected-user');
}

function handleStatusOfflineInOnline(data: any) {
	removeDiv(data.username, 'user-item');

	inviteStore.unsubscribe(data.username);
	inviteStore.removeFriend(data.username);
	inviteStore.removeUser(data.username);
}

export const offlineHandlers = {
	friends: handleStatusOfflineInFriends,
	chat: handleStatusOfflineInChat,
	online: handleStatusOfflineInOnline,
};


async function handleOnlineUserInOnline(data: any) {
	setOnlineInOnline(data, false, 'online-users', (user) => inviteStore.addUser(user));
}

export const onlineUserHandlers = {
	online: handleOnlineUserInOnline,
};


function handleStatusOnlineInFriends(data: any) {
	changeStatusColorOnline('user-item', data.username);

	const friend = friendsStore.getFriend(data.username);
	if (!friend)
		return;
	friend.online = true;
}

function handleStatusOnlineInChat(data: any) {
	changeStatusColorOnline('friend-chat', data.username);
	changeStatusColorOnline('chat-user-info', data.username);

	const connectedList = document.getElementById('general-div');
	if (!connectedList)
		return;
	if (!connectedList.classList.contains('connected-friends'))
		return;
	const user: UsersInfo = {
		username: data.username,
		online: true,
		link_avatar: data.link_avatar
	};
	connectedList.insertAdjacentHTML('beforeend', renderOneConnectedUser(user));
}

async function handleStatusOnlineInOnline(data: any) {
	setOnlineInOnline(data, true, 'online-friends', (user) => inviteStore.addFriend(user));
}

export const onlineHandlers = {
	friends: handleStatusOnlineInFriends,
	chat: handleStatusOnlineInChat,
	online: handleStatusOnlineInOnline,
};
