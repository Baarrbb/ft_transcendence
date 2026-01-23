
import type { UsersInfo, UsersListResponse, UserGameState } from '@shared/types/users.ts';
import { populateList, setupSearch } from '../../commonLayout.ts';
import { friendsService } from '../../../services/friends.ts';
import { usersService } from '../../../services/users.ts';
import { matchService } from '../../../services/match.ts';
import { setupOnlineListeners } from './listeners.ts';
import { catchHttpError } from '../../../utils/catchError.ts';
import { updateUserButton, cleanSubscription } from './utils.ts';
import { inviteStore } from '../../../store/inviteStore.ts';
import { getUserGameState } from '../../invite/buttons.ts';

function renderConnectedUsers(title: string, id: string): string {
	return /*ts*/`
	<div class="flex flex-col text-[#d4ced4] w-full h-full bg-[#02010f]/80 backdrop-blur-sm border border-[var(--color-primary)] rounded-2xl shadow-xl">
		<div class="flex-shrink-0 p-4 sm:p-6 bg-[var(--color-primary)]/10 border-b border-[var(--color-primary)]/30 rounded-t-2xl min-h-[3rem] sm:min-h-[3.5rem] flex items-center justify-center">
			<h3 class="text-xl font-display uppercase tracking-wide text-[var(--color-primary-light)] text-center font-bold relative">
				<span class="relative z-10 backdrop-blur-sm px-2">${title}</span>
				<div class="absolute inset-0 flex items-center">
					<div class="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</div>
			</h3>
		</div>

		<div class="flex-1 flex flex-col p-4 sm:p-6 gap-4 min-h-0">
			<div class="relative">
				<input 
					type="text" 
					placeholder="Search connected..." 
					class="w-full pl-5 pr-4 py-3 bg-[var(--color-primary-bg)] border border-[var(--color-primary)] rounded-lg text-[#d4ced4] placeholder-[#888] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
					id="${id}-search"
				>
			</div>
			<ol class="flex-1 overflow-auto custom-scrollbar space-y-2 min-h-0" id="${id}">
			</ol>
		</div>
	</div>
	`;
}

export function renderOnlineGame(): string {
	return /*ts*/`
		<div id='online-game' class="relative h-screen w-full p-4 overflow-auto flex flex-col">
			<div class="text-center mb-8 flex-shrink-0">
				<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] relative">
					<span class="relative z-10">Pong Arena</span>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</h2>
			</div>

			<div class="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 flex-1">
				<div class="w-full sm:min-w-[325px] sm:max-w-[30vw] h-[60vh] flex-shrink-0">
					${renderConnectedUsers("Friends connected", "online-friends")}
				</div>

				<div class="w-full sm:min-w-[325px] sm:max-w-[30vw] h-[60vh] flex-shrink-0">
					${renderConnectedUsers("Users connected", "online-users")}
				</div>
			</div>
		</div>
	`;
}

function renderInviteSentBtn(): string {
	return /*ts*/`
		<div
			class="game-btn flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-700 disabled">
				<span class="leading-none">pending</span>
				<button data-action='cancel'>
					<img src="/svg/close-md.svg" alt="Remove invitation" class=" inline-block w-[1rem] h-[1rem] cursor-pointer align-middle"/>
				</button>
		</div>
	`;
}

function renderInviteReceivedBtn(): string {
	return /*ts*/`
		<div data-action='invite-response' class="game-btn flex gap-1">
			<button data-action='accept'
				class="bg-green-800 hover:bg-green-600 px-2 py-1 rounded text-sm font-bold transition-colors duration-200">
					<img src="/svg/check.svg" alt="Accept game" class="w-6 h-6 text-xs"/>
			</button>
			<button data-action='decline'
				class="bg-red-800 hover:bg-red-600 px-2 py-1 rounded text-sm font-bold transition-colors duration-200">
					<img src="/svg/close-md.svg" alt="Decline game" class="w-6 h-6 text-xs"/>
			</button>
		</div>
	`;
}

function renderInviteAcceptedBtn(username: string, matchId: string): string {
	return /*ts*/`
		<button data-match="${matchId}" data-action='join'
			class="game-btn flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-700 hover:bg-gray-500 transition-colors duration-200 cursor-pointer">
				<span class="leading-none">time left</span>
				<span id='time-left-${username}'></span>
		</button>
	`;
}

export function renderSendInvite(): string {
	return /*ts*/`
		<button data-action='invite'
			class="game-btn bg-green-700 hover:bg-green-600 px-2 py-1 rounded text-sm font-bold transition-colors duration-200">
				<img src="/svg/ping-pong.svg" alt="Play pong" class="w-6 h-6 text-xs"/>
		</button>
	`;
}

function renderInGameButton(): string {
	return /*ts*/`
		<button data-action='none'
			class="game-btn flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-700 disabled">
				<span class="leading-none">IN GAME</span>
		</button>
	`;
}

function renderChatBtn(): string {
	return /*ts*/`
		<button data-action='chat'
			class="bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded text-sm font-bold transition-colors duration-200">
				<img src="/svg/chat-conv.svg" alt="Open chat" class="w-6 h-6 text-xs"/>
		</button>
	`;
}

export function renderButton(user: UserGameState): string {
	switch(user.invite) {
		case 'sent':
			return renderInviteSentBtn();
		case 'received':
			return renderInviteReceivedBtn();
		case 'accepted':
			return renderInviteAcceptedBtn(user.username, user.matchId as string);
		case 'occupied':
			return renderInGameButton();
		default:
			return renderSendInvite()
	}
}

export function renderOneUser(user: UserGameState): string {
	return /*ts*/`
		<li data-username="${user.username}" class="user-item flex min-w-max justify-between items-center p-2 border-b border-[var(--color-primary)] text-[#d4ced4]">
			<span class="flex items-center gap-3 min-w-0">
				<img src="/uploads/${user.link_avatar}" alt="User Avatar"
					class="inline-block w-10 h-10 rounded-full object-cover border-2 border-[var(--color-primary)] align-middle flex-shrink-0">
				
				<span class="font-semibold text-lg truncate transition-colors duration-200 hover:text-[var(--color-primary-light)] drop-shadow">
					${user.username}
				</span>
				<div class="flex items-center gap-1 ml-2 text-xs flex-shrink-0">
					<span class="w-2 h-2 rounded-full ${user.online ? 'bg-green-400' : 'bg-gray-400'} inline-block border border-[var(--color-primary-bg-dark)]"></span>
					<span class="${user.online ? 'text-green-400' : 'text-gray-400'}">
						${user.online ? 'Online' : 'Offline'}
					</span>
				</div>
			</span>
			<div class="flex items-center gap-2 flex-shrink-0">
				<span class="text-[var(--color-primary)] flex-shrink-0">${user.elo}</span>
				${renderButton(user)}
				${user.friend ? renderChatBtn() : "" }
			</div>
		</li>
	`;
}


export async function populateConnectedUsers() {
	try {
		let friendsList: UserGameState[] = [];
		let usersList: UserGameState[] = [];
		const inviteStatus: any = await matchService.invitationsStatus();
		console.log(inviteStatus)

		const friends: UsersListResponse = await friendsService.getOnlineFriends();
		if (friends.success && friends.users) {
			friendsList = friends.users.map((u: UsersInfo) => getUserGameState(u, true, inviteStatus.users));
			inviteStore.setFriends(friendsList);
			populateList('online-friends', inviteStore.getFriends(), renderOneUser);
			// setupSearch('online-friends-search', 'online-friends', inviteStore.getFriends(), renderOneUser);
			setupSearch('online-friends-search', 'online-friends', () => inviteStore.getFriends(), renderOneUser);
		}
		const users: UsersListResponse = await usersService.getUsersOnline();
		if (users.success && users.users) {
			usersList = users.users.map((u: UsersInfo) => getUserGameState(u, false, inviteStatus.users));
			inviteStore.setUsers(usersList);
			populateList('online-users', inviteStore.getUsers(), renderOneUser);
			// setupSearch('online-users-search', 'online-users', inviteStore.getUsers(), renderOneUser);
			setupSearch('online-users-search', 'online-users', () => inviteStore.getUsers(), renderOneUser);
		}

		cleanSubscription();

		inviteStore.getFriends().forEach((user: UserGameState) => {
			inviteStore.subscribe(user.username, updateUserButton);
		})
		inviteStore.getUsers().forEach((user: UserGameState) => {
			inviteStore.subscribe(user.username, updateUserButton);
		})

		setupOnlineListeners();
	}
	catch (error) {
		catchHttpError('Connected users error:', error);
	}
}
