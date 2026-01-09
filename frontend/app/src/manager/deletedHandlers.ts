
import type { UsersListResponse } from '@shared/types/users.ts';
import { friendsStore } from "../store/friendsStore.ts";
import { removeDiv } from './utilsHandlers.ts'
import { populateFriendsFriends } from '../components/friends/render.ts';
import { populateChatFriends } from '../components/chat/render.ts'
import { populateConnectedUsers } from '../components/chat/renderChatHub.ts'
import { friendsService } from '../services/friends.ts';
import { usersService } from '../services/users.ts';
import { populateList } from '../components/commonLayout.ts';
import { renderOneUser } from '../components/dashboard/render.ts';


async function handleDeleteInFriends(data: any) {
	const user = friendsStore.getUser(data.username);
	if (user) {
		friendsStore.unsubscribe(data.username);
		friendsStore.removeUser(data.username);
		removeDiv(data.username, 'user-item');
	}
	else
		populateFriendsFriends();
}

function handleDeleteInChat(data: any) {
	populateChatFriends();
	const chatHeaderUser = document.getElementById('chat-header') as HTMLElement;
	if (!chatHeaderUser)
		return;
	if (chatHeaderUser.getAttribute('data-username') === data.username)
		populateConnectedUsers()
}

async function handleDeleteInDashboard() {
	const response: UsersListResponse = await usersService.getUsersFilters("elo", "50");
	if (response.success && response.users)
		populateList('global-list', response.users, (user, i) => renderOneUser(user, i));
	const friends: UsersListResponse = await friendsService.getFriends("elo", "50");
	if (friends.success && friends.users)
		populateList('friends-list', friends.users, (user, i) => renderOneUser(user, i));
}

export const deletedHandlers = {
	friends: handleDeleteInFriends,
	chat: handleDeleteInChat,
	dashboard: handleDeleteInDashboard
};
