
import { showUserStats } from '../profil/showStats.ts';

async function onUserClickContainer(e: Event) {
	const target = (e.target  as HTMLElement).closest<HTMLSpanElement>('.show-profil');
	if (!target)
		return;
	const username = target.dataset.username;
	if (!username)
		return;
	await showUserStats(username);
}

let onUserClick: ((e: Event) => void) | null = null;

export function setupDashboardListeners() {
	const globalList = document.getElementById('global-list');
	const friendList = document.getElementById('friends-list');

	if (onUserClick) {
		globalList?.removeEventListener('click', onUserClick);
		friendList?.removeEventListener('click', onUserClick);
	}
	onUserClick = onUserClickContainer;
	globalList?.addEventListener('click', onUserClick);
	friendList?.addEventListener('click', onUserClick);
}
