
import type { UsersListResponse, UserGameState, InvitationStatus } from '@shared/types/users.ts';
import { friendsService } from '../services/friends.ts';
import { renderOneUser as renderOneUserDashboard } from '../components/dashboard/render.ts';
import { populateList } from '../components/commonLayout.ts';
import { populateConnectedUsers } from '../components/chat/renderChatHub.ts';
import { matchService } from '../services/match.ts';
import { renderOneUser as renderOneUserOnline} from '../components/home/online/render.ts';
import { updateUserButton } from '../components/home/online/utils.ts'
import { inviteStore } from '../store/inviteStore.ts';

export async function handleInDashboard() {
	const friends: UsersListResponse = await friendsService.getFriends("elo", "50");
	if (friends.success && friends.users)
		populateList('friends-list', friends.users, (user, i) => renderOneUserDashboard(user, i));
}

export function removeDiv(username: string, divClassName: string) {
	const userDiv = document.querySelector(`.${divClassName}[data-username=${username}]`);
	if (userDiv)
		userDiv.remove();
}

export async function handleInChat(username: string) {
	removeDiv(username, 'friend-chat');

	const connectedList = document.getElementById('general-div');
	const connectedDiv = connectedList?.querySelector(`.connected-user[data-username="${username}"]`);
	if (connectedDiv)
		connectedDiv.remove();

	const chatHeader = document.getElementById('chat-header');
	if (chatHeader && chatHeader.getAttribute('data-username') === username){
		chatHeader.removeAttribute('data-username');
		document.getElementById('header-btn')?.classList.add('hidden');
		await populateConnectedUsers();
	}
}

export function changeStatusColorOnline(divClassName: string, username: string) {
	const userDiv = document.querySelector(`.${divClassName}[data-username=${username}]`)
	if (!userDiv)
		return;
	const statusPin = userDiv.querySelector('.status-pin');
	if (statusPin) {
		statusPin.classList.remove('bg-gray-400');
		statusPin.classList.add('bg-green-400');
	}
	const statusText = userDiv.querySelector('.status-text');
	if (statusText) {
		statusText.innerHTML = 'Online';
		statusText.classList.remove('text-gray-400');
		statusText.classList.add('text-green-400');
	}
}

export function changeStatusColorOffline(divClassName: string, username: string) {
	const userDiv = document.querySelector(`.${divClassName}[data-username=${username}]`)
	if (!userDiv)
		return;
	const statusPin = userDiv.querySelector('.status-pin');
	if (statusPin) {
		statusPin.classList.remove('bg-green-400');
		statusPin.classList.add('bg-gray-400');
	}
	const statusText = userDiv.querySelector('.status-text');
	if (statusText) {
		statusText.innerHTML = 'Offline';
		statusText.classList.remove('text-green-400');
		statusText.classList.add('text-gray-400');
	}
}

export async function setOnlineInOnline(data: any, isFriend: boolean, containerId: string, inviteStoreFct: (user: UserGameState) => void) {
	const inviteStatus: any = await matchService.invitationsStatus();
	let invite: InvitationStatus = 'none';
	const isInvite = inviteStatus.users.find((u: any) => u.username === data.username)
	if (isInvite)
		invite = isInvite.status;
	const user: UserGameState = {
		username: data.username,
		link_avatar: data.link_avatar,
		online: true,
		elo: data.elo,
		friend: isFriend,
		invite,
		matchId: invite === 'accepted' ? isInvite.matchId : undefined
	}
	const list = document.getElementById(containerId) as HTMLElement;
	list?.insertAdjacentHTML('beforeend', renderOneUserOnline(user));
	inviteStoreFct(user);

	inviteStore.subscribe(user.username, updateUserButton)
}
