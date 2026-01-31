
import type { UsersListResponse, UsersInfo } from '@shared/types/users.ts'
import { renderView, populateList } from '../commonLayout.ts';
import { usersService } from '../../services/users.ts';
import { friendsService } from '../../services/friends.ts';
import { catchHttpError } from '../../utils/catchError.ts';
import { setupDashboardListeners } from './listeners.ts';

export function renderDashboard(): string {
	return renderView('dashboard', 'Global', 'Friends', 'global-list', 'friends-list');
}

export function renderOneUser(user: UsersInfo, i: number): string {
	return /*ts*/`
		<li class="user-item flex justify-between items-center p-2 border-b border-[var(--color-primary)] text-[#d4ced4] ${user.me ? 'bg-[var(--color-primary-bg)] ring-2 ring-[var(--color-primary-light)]' : ''}">
			<span>
				<span class="text-[var(--color-primary-light)] font-bold text-lg mr-2 ">#${i + 1}</span>
				<span data-username="${user.username}" class='show-profil cursor-pointer'>
					<span class="font-semibold text-lg transition-colors duration-200 hover:text-[var(--color-primary-light)] drop-shadow">
						<img 
							class="inline-block w-10 h-10 rounded-full object-cover border-2 border-[var(--color-primary)] mr-2 align-middle"
							src="/uploads/${user.link_avatar}" 
							alt="User Avatar">
					</span>
					<span class="font-semibold text-lg transition-colors duration-200 hover:text-[var(--color-primary-light)] drop-shadow">
						${user.username}
					</span>
				</span>
			</span>
			<span class="text-[var(--color-primary)] font-bold text-lg">${user.elo}</span>
		</li>
	`;
}

export async function populateDashboard() {
	try {
		const response: UsersListResponse = await usersService.getUsersFilters("elo", "50");
		if (response.success && response.users)
			populateList('global-list', response.users, (user, i) => renderOneUser(user, i));

		const friends: UsersListResponse = await friendsService.getFriends("elo", "50");
		if (friends.success && friends.users)
			populateList('friends-list', friends.users, (user, i) => renderOneUser(user, i));

		setupDashboardListeners();
	}
	catch (error) {
		catchHttpError('Global dashboard error:', error);
	}
}
