// ===== DASHBOARD LISTENERS =====
// Ce fichier gere les clics sur les joueurs dans le dashboard
// Quand on clique sur un username, ca ouvre une popup avec ses stats

import { showUserStats } from '../profil/showStats.ts';

// Quand on clique sur un joueur, on recupere son username et on affiche ses stats
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

// Met en place les listeners de clic sur les 2 listes (global + friends)
// Un seul listener par liste grace a la delegation d'evenements
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
