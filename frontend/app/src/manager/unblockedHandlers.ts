
import type { UserFriendState, UserGameState } from '@shared/types/users.ts';
import { renderOneUser as renderOneUserInFriends, updateButton } from '../components/friends/render.ts'
import { renderOneUser as renderOneUserInOnline } from '../components/home/online/render.ts';
import { friendsStore } from '../store/friendsStore.ts';
import { inviteStore } from '../store/inviteStore.ts';
import { updateUserButton } from '../components/home/online/utils.ts';

async function handleUnblockedInFriends(data: any) {
	const userUnblock: UserFriendState = {
		username: data.username,
		link_avatar: data.link_avatar,
		elo: data.elo,
		invite: 'none'
	}

	const list = document.getElementById('add-friend') as HTMLElement;
	list?.insertAdjacentHTML('beforeend', renderOneUserInFriends(userUnblock));

	friendsStore.addUser(userUnblock);
	friendsStore.subscribe(userUnblock.username, updateButton);
}

function handleUnblockedInOnline(data: any) {
	const user: UserGameState = {
		username: data.username,
		link_avatar: data.link_avatar,
		online: data.online ? true : false,
		elo: data.elo,
		friend: false,
		invite: 'none'
	}
	if (user.online) {
		const list = document.getElementById('online-users') as HTMLElement;
		list.insertAdjacentHTML('beforeend', renderOneUserInOnline(user));
	}

	inviteStore.addUser(user);
	inviteStore.subscribe(user.username, updateUserButton)
}


export const unblockedHandlers = {
	friends: handleUnblockedInFriends,
	online: handleUnblockedInOnline,
};

