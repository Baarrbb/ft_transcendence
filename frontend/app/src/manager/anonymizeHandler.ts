
import { friendsStore } from "../store/friendsStore.ts";
import { removeDiv } from './utilsHandlers.ts'
import { populateFriendsFriends } from '../components/friends/render.ts';
import { populateChatFriends } from '../components/chat/render.ts'
import { populateConnectedUsers } from '../components/chat/renderChatHub.ts'

async function handleAnonymizeInFriends(data: any) {
	const user = friendsStore.getUser(data.username);
	if (user) {
		friendsStore.unsubscribe(data.username);
		friendsStore.removeUser(data.username);
		removeDiv(data.username, 'user-item');
	}
	else
		populateFriendsFriends();
}

function handleAnonymizeInChat(data: any) {
	populateChatFriends();
	const chatHeaderUser = document.getElementById('chat-header') as HTMLElement;
	if (!chatHeaderUser)
		return;
	if (chatHeaderUser.getAttribute('data-username') === data.username)
		populateConnectedUsers()
}

export const anonymizeHandlers = {
	friends: handleAnonymizeInFriends,
	chat: handleAnonymizeInChat
};
