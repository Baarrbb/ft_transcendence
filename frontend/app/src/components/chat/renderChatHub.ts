
import type { UsersListResponse, UsersInfo } from '@shared/types/users.ts'
import { setupListernersConnectedUsers } from './listeners.ts'
import { friendsService } from '../../services/friends.ts';
import { catchHttpError } from '../../utils/catchError.ts';


export function renderOneConnectedUser(u: UsersInfo): string {
	return /*ts*/`
		<div data-username="${u.username}" class="connected-user flex items-center gap-3 mb-2 bg-[var(--color-primary-bg-dark)]/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-[var(--color-primary)] cursor-pointer hover:bg-[var(--color-primary-bg)]/80">
			<img src="/uploads/${u.link_avatar}" class="w-8 h-8 rounded-full object-cover"/>
			<div>
				<div class="text-[#d4ced4] font-semibold">
					${u.username}
				</div>
				<div class="text-xs text-[var(--color-primary)]">
					<span class="status-pin w-2 h-2 rounded-full ${u.online ? 'bg-green-400' : 'bg-gray-400'} inline-block border border-[var(--color-primary-bg-dark)]"></span>
					<span class="status-text ${u.online ? 'text-green-400' : 'text-gray-400'}">
						${u.online ? 'Online' : 'Offline'}
					</span>
				</div>
			</div>
		</div>
	`
}

export async function populateConnectedUsers() {
	const header = document.getElementById('chat-header') as HTMLElement;
	if (!header)
		return;
	header.textContent = 'Connected friends';
	const headerBtn = document.getElementById('header-btn');
	headerBtn?.classList.add('hidden');

	try {
		const response: UsersListResponse = await friendsService.getFriends("creation", "");
		if (response.success && response.users) {
			const chatInputZone = document.getElementById('chat-input-zone');
			if (!chatInputZone)
				return;
			chatInputZone.classList.add('hidden');
			const div = document.getElementById('general-div');
			if (!div)
				return;
			div.classList.remove('conv-user');
			div.classList.add('connected-friends');
			div.removeAttribute('data-username');
			div.removeAttribute('data-channel');
			div.innerHTML = response.users
				.filter((u: UsersInfo) => u.online)
				.map((u: UsersInfo) => {
					return renderOneConnectedUser(u);
				}).join('');

			setupListernersConnectedUsers();
		}
	}
	catch (error) {
		catchHttpError('Chat view error:', error);
	}
}
