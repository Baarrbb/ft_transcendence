
import type { InvitationStatus, UsersInfo, UserGameState } from '@shared/types/users.ts'

function renderSentInvite(username: string): string {
	return /*ts*/`
		<button data-username="${username}"
			class="game-btn flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-700 disabled">
				<span class="text-white leading-none">sent</span>
		</button>
	`;
}

function renderReceivedInvite(username: string): string {
	return /*ts*/`
		<button data-username="${username}"
			class="game-btn flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-700 disabled">
				<span class="text-white leading-none">received</span>
		</button>
	`;
}

function renderInviteGame(username: string): string {
	const iconBtnBase = "w-9 h-9 flex items-center justify-center rounded transition-colors duration-200 flex-shrink-0";
	return /*ts*/`
		<button data-action='invite' data-username="${username}"
			class="game-btn bg-green-700 hover:bg-green-600 ${iconBtnBase}">
				<img src="/svg/ping-pong.svg" alt="Play pong" class="w-6 h-6 text-xs"/>
		</button>
	`
}

function renderAcceptedInvite(username: string): string {
	return /*ts*/`
		<button data-username="${username}"
			class="game-btn flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-700 disabled">
				<span class="text-white leading-none">accepted</span>
		</button>
	`;
}

export function renderInGameButton(): string {
	return /*ts*/`
		<button
			class="game-btn flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-700 disabled">
				<span class="text-white leading-none">IN GAME</span>
		</button>
	`;
}


export function renderButtonGame(invite: InvitationStatus, username: string) {
	switch (invite) {
		case 'sent':
			return renderSentInvite(username);
		case 'received':
			return renderReceivedInvite(username);
		case 'occupied':
			return renderInGameButton();
		case 'accepted':
			return renderAcceptedInvite(username);
		default:
			return renderInviteGame(username);
	}
}

export function getUserGameState(user: UsersInfo, friend: boolean, inviteStatus: any[]): UserGameState {
	let invite = 'none';
	const isInvite = inviteStatus.find(u => u.username === user.username)
	if (isInvite)
		invite = isInvite.status;
	return {
		...user,
		friend,
		invite,
		matchId: invite === 'accepted' ? isInvite.matchId : undefined
	} as UserGameState;
}
