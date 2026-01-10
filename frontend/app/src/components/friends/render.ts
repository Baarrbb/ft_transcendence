
import type { UsersListResponse, UsersInfo, UserFriendState, UserGameState } from '@shared/types/users.ts';
import { renderView } from '../commonLayout.ts';
import { populateList, setupSearch } from '../commonLayout.ts';
import { usersService } from '../../services/users.ts';
import { friendsService } from '../../services/friends.ts'
import { catchHttpError } from '../../utils/catchError.ts';
import { setupListenersFriends } from './listeners.ts';
import { stringToElement } from '../utils.ts';
import { friendsStore } from '../../store/friendsStore.ts';

import { inviteStore } from '../../store/inviteStore.ts';
import { matchService } from '../../services/match.ts'
import { renderButtonGame, getUserGameState } from '../invite/buttons.ts';


export function renderFriends(): string {
	return renderView("friends", "Your friends", "Add a new friend", "friends-list", "add-friend", ['search', 'search']);
}

function renderInviteSentBtn(): string {
	return /*ts*/`
		<button
			class="invite-btn px-2 py-1 rounded text-xs font-bold bg-gray-700">
			Pending
		</button>
	`;
}

function renderInviteReceivedBtn(): string {
	const iconBtnBase = "w-9 h-9 flex items-center justify-center rounded transition-colors duration-200 flex-shrink-0";
	return /*ts*/`
		<div class="flex gap-1 invite-btn">
			<button data-action='accept'
				class="bg-green-800 hover:bg-green-600 ${iconBtnBase}">
					<img src="/svg/check.svg" alt="Accept friend" class="w-6 h-6 text-xs"/>
			</button>
			<button data-action='decline'
				class="bg-yellow-800 hover:bg-yellow-600 ${iconBtnBase}">
					<img src="/svg/close-md.svg" alt="Decline friend" class="w-6 h-6 text-xs"/>
			</button>
		</div>
	`;
}

function renderSendInvite(): string {
	const iconBtnBase = "w-9 h-9 flex items-center justify-center rounded transition-colors duration-200 flex-shrink-0";
	return /*ts*/`
		<button data-action='add'
			class="invite-btn add-friends-button bg-blue-950 hover:bg-blue-600 ${iconBtnBase}">
				<img src="/svg/add-plus.svg" alt="Add friend" class="w-6 h-6 text-xs"/>
		</button>
	`;
}

function renderButton(user: UserFriendState): string {
	switch(user.invite) {
		case 'sent':
			return renderInviteSentBtn();
		case 'received':
			return renderInviteReceivedBtn();
		default:
			return renderSendInvite();
	}
}

export function renderOneUser(user: UserFriendState): string {
	const iconBtnBase = "w-9 h-9 flex items-center justify-center rounded transition-colors duration-200 flex-shrink-0";
	return /*ts*/`
		<li data-username="${user.username}" class="user-item flex justify-between items-center p-2 border-b border-[var(--color-primary)] text-[#d4ced4]">
			<span data-action='show' class="font-semibold text-lg transition-colors duration-200 hover:text-[var(--color-primary-light)] drop-shadow cursor-pointer">
				<img 
					class="inline-block w-10 h-10 rounded-full object-cover border-2 border-[var(--color-primary)] mr-2 align-middle"
					src="/uploads/${user.link_avatar}"
					alt="User Avatar">
					<span class=''>${user.username}</span>
			</span>
			<div class="flex items-center gap-2">
				<span class="text-[var(--color-primary)]">${user.elo}</span>
				${renderButton(user)}
				<button data-action='block'
					class="bg-red-800 hover:bg-red-600 ${iconBtnBase}">
						<img src="/svg/stop-sign.svg" alt="Block user" class="w-6 h-6 text-xs"/>
				</button>
			</div>
		</li>
	`;
}

export function renderOneFriend(user: UserGameState): string {
	const iconBtnBase = "w-9 h-9 flex items-center justify-center rounded transition-colors duration-200 flex-shrink-0";
	return /*ts*/`
		<li data-username="${user.username}" class="user-item flex justify-between items-center p-2 border-b border-[var(--color-primary)] text-[#d4ced4]">
			<span class="flex items-center gap-3">
				<span data-action='show' class="font-semibold text-lg transition-colors duration-200 hover:text-[var(--color-primary-light)] drop-shadow cursor-pointer">
					<img src="/uploads/${user.link_avatar}" alt="User Avatar"
						class="inline-block w-10 h-10 rounded-full object-cover border-2 border-[var(--color-primary)] mr-2 align-middle">
					<span>
						${user.username}
					</span>
				</span>
				<div class="flex items-center gap-1 ml-2 text-xs">
					<span class="status-pin w-2 h-2 rounded-full ${user.online ? 'bg-green-400' : 'bg-gray-400'} inline-block border border-[var(--color-primary-bg-dark)]">
					</span>
					<span class="status-text ${user.online ? 'text-green-400' : 'text-gray-400'}">
						${user.online ? 'Online' : 'Offline'}
					</span>
				</div>
			</span>
			<div class="flex items-center gap-2">
				<span class="text-[var(--color-primary)]">${user.elo}</span>
				${user.is_anon === 1 ? "" : renderButtonGame(user.invite, user.username)}
				<button data-action='chat'
					class="bg-blue-700 hover:bg-blue-600 ${iconBtnBase}">
						<img src="/svg/chat-conv.svg" alt="Open chat" class="w-6 h-6 text-xs"/>
				</button>
				<button data-action='remove'
					class="bg-yellow-700 hover:bg-yellow-600 ${iconBtnBase}">
						<img src="/svg/close-md.svg" alt="Remove friend" class="w-6 h-6 text-xs"/>
				</button>
				<button data-action='block'
					class="bg-red-800 hover:bg-red-600 ${iconBtnBase}">
						<img src="/svg/stop-sign.svg" alt="Block user" class="w-6 h-6 text-xs"/>
				</button>
			</div>
		</li>
	`;
}

export async function populateFriendsFriends() {
	let friendsList: UserFriendState[] = [];
	const friends: UsersListResponse = await friendsService.getFriends("creation", "");
	if (friends.success && friends.users) {
		friendsList = friends.users.map((u: UsersInfo) => { return { ...u } as UserFriendState })
		friendsStore.setFriends(friendsList);

		const gameState: any = await matchService.invitationsStatus();
		const friendsListGameState: UserGameState[] = friendsList.map((u: UserFriendState) => getUserGameState(u, true, gameState.users));
		inviteStore.setFriends(friendsListGameState);

		friendsList.forEach((friend: UserFriendState) => {
			friend.inviteGameStatus = getUserGameState(friend, true, gameState.users).invite;
		})

		populateList('friends-list', inviteStore.getFriends(), renderOneFriend);
		setupSearch('friends-list-search', 'friends-list', () => inviteStore.getFriends(), renderOneFriend);
	}
}

export async function populateFriends() {
	try {
		populateFriendsFriends();

		let usersList: UserFriendState[] = [];
		const inviteStatus: any = await usersService.getInvitationsStatus();
		const users: UsersListResponse = await usersService.getNonFriends();
		if (users.success && users.users) {
			usersList = users.users.map((u: UsersInfo) => getUserFriendState(u, inviteStatus.users));
			friendsStore.setUsers(usersList);
			populateList('add-friend', friendsStore.getUsers(), renderOneUser);
			setupSearch('add-friend-search', 'add-friend', () => friendsStore.getUsers(), renderOneUser);
		}

		friendsStore.getUsers().forEach((user: UserFriendState) => {
			friendsStore.subscribe(user.username, updateButton);
		})

		inviteStore.getFriends().forEach((user: UserGameState) => {
			inviteStore.subscribe(user.username, updateButtonGameState);
		})

		setupListenersFriends();
	}
	catch (error) {
		catchHttpError('Friends view error:', error);
	}
}

function getUserFriendState(user: UsersInfo, inviteStatus: any[]): UserFriendState {
	let invite = 'none';
	const isInvite = inviteStatus.find(u => u.username === user.username)
	if (isInvite)
		invite = isInvite.status;
	return {
		...user,
		invite,
	} as UserFriendState;
}

export function updateButton(user: UserFriendState) {
	const divUser = document.querySelector(`.user-item[data-username=${user.username}]`)
	if (!divUser)
		return;
	const btn = divUser.querySelector('.invite-btn')
	if (!btn)
		return;
	const newBtn = renderButton(user);
	btn.replaceWith(stringToElement(newBtn));
}

export function updateButtonGameState(user: UserGameState) {
	const divUser = document.querySelector(`.user-item[data-username=${user.username}]`)
	if (!divUser)
		return;
	const btn = divUser.querySelector('.game-btn')
	if (!btn)
		return;
	const newBtn = renderButtonGame(user.invite, user.username);

	btn.replaceWith(stringToElement(newBtn));
}
