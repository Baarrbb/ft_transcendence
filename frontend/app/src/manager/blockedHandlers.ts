
import { handleInDashboard, removeDiv, handleInChat } from './utilsHandlers.ts';
import { inviteStore } from '../store/inviteStore.ts';
import { friendsStore } from '../store/friendsStore.ts';

function handleBlockedInDashboard() {
	handleInDashboard();
}

function handleBlockedInFriends(data: any) {
	removeDiv(data.username, 'user-item');

	friendsStore.unsubscribe(data.username);
	friendsStore.removeFriend(data.username);
	friendsStore.removeUser(data.username);

	inviteStore.unsubscribe(data.username);
	inviteStore.removeFriend(data.username);
}

function handleBlockedInChat(data: any) {
	handleInChat(data.username);
}

function handleBlockedInOnline(data: any) {
	removeDiv(data.username, 'user-item');

	inviteStore.unsubscribe(data.username);
	inviteStore.removeFriend(data.username);
	inviteStore.removeUser(data.username);
}

export const blockedHandlers = {
	dashboard: handleBlockedInDashboard,
	friends: handleBlockedInFriends,
	chat: handleBlockedInChat,
	online: handleBlockedInOnline,
};
