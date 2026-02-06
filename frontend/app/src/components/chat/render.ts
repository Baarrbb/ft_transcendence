// ===== CHAT RENDER =====
// Ce fichier gere l'affichage principal du chat :
// - La page chat avec la liste des amis a gauche et la conversation a droite
// - Le rendu de chaque ami dans la sidebar
// - Le chargement des donnees (liste d'amis, conversation)
// - La gestion mobile (affiche soit les amis soit le chat, pas les deux)

import type { UsersListResponse, UsersInfo } from '@shared/types/users.ts'
import { friendsService } from '../../services/friends.ts';
import { setupListenersChatFriends } from './listeners.ts'
import { catchHttpError } from '../../utils/catchError.ts';
import { highlightFriend } from './utils.ts';
import { populateConnectedUsers } from './renderChatHub.ts';
import { populateChatWithFriend } from './renderChatRoom.ts';

type MobileChatView = 'friends' | 'chat';

// Detecte si on est en mode mobile (ecran < 1024px)
export function isMobile() {
	return window.innerWidth < 1024;
}

// En mobile, on switch entre la vue "liste d'amis" et la vue "conversation"
// Car l'ecran est trop petit pour afficher les deux en meme temps
export function setMobileChatView(view: MobileChatView) {
// 	mobileChatView = view;

	const aside = document.querySelector('aside');
	const main = document.getElementById('right-card');
	console.log("main", main)

	if (!isMobile())
		return;

	if (view === 'friends') {
		aside?.classList.remove('hidden');
		main?.classList.add('hidden');
	}
	else {
		aside?.classList.add('hidden');
		main?.classList.remove('hidden');
	}
}

// Genere le HTML principal de la page chat (titre + carte chat)
export function renderChat(): string {
	return /*ts*/`
		<div id="profil-content" class='h-full'>
			<div class="flex flex-col h-full w-full p-4 overflow-auto custom-scrollbar">
				<div class="text-center mb-8 flex-shrink-0">
					<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 relative">
						<span class="relative z-10">Chat</span>
						<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
					</h2>
				</div>

				<div class="flex flex-col lg:flex-row gap-6 w-full flex-1 justify-center items-start lg:items-center max-w-7xl mx-auto">
					${renderChatCard()}
				</div>
			</div>
		</div>
	`;
}

// Genere la carte chat : sidebar amis a gauche + zone de conversation a droite
function renderChatCard(): string {
	return /*ts*/`
		<div class="flex items-stretch w-full h-[80vh] lg:h-[80vh] bg-transparent rounded-2xl shadow-2xl border border-[var(--color-primary)] overflow-hidden min-w-0">
			<aside class="w-full lg:w-64 min-w-[16rem] bg-[var(--color-primary-bg-dark)]/80 border-r border-[var(--color-primary)] flex flex-col">
				<div class="flex flex-col items-center justify-between px-4 py-3 border-b border-[var(--color-primary)] flex-shrink-0">
					<span class="text-lg font-bold text-[var(--color-primary-light)]">
						Friends
					</span>
				</div>
				<div class="flex-1 overflow-y-auto min-h-0">
					<ul id="chat-friends-list" class="divide-y divide-[var(--color-primary)]">
					</ul>
				</div>
			</aside>

			<div id='right-card' class="flex flex-col flex-1 min-w-0 h-full bg-[#02010f]/80 backdrop-blur-sm">
				<div class="flex-shrink-0 flex items-center px-4 py-3 h-[10vh] border-b border-[var(--color-primary)] bg-[var(--color-primary-bg-dark)]/80">
					<div id='back-header-btn' class="w-8 flex justify-start hidden">
					</div>
					<div id="chat-header" class="flex-1 text-center text-[#d4ced4] font-semibold">
					</div>
					<div id='header-btn' class='flex justify-end hidden'>
					</div>
				</div>

				<div class="flex-1 flex flex-col min-h-0">
					<div id='general-div' class="flex-1 overflow-y-auto px-4 py-2 space-y-2 min-h-0">
					</div>

					<div id='chat-input-zone' class='hidden flex-shrink-0'>
						<div class="flex items-center gap-2 px-4 py-3 border-t border-[var(--color-primary)] bg-[var(--color-primary-bg-dark)]/80 flex-wrap">
							<input
								type="text"
								placeholder="Type your message..."
								class="flex-1 min-w-0 px-4 py-2 rounded-lg bg-[#1a1712]/80 text-[#d4ced4] border border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
								id="chat-input"
								autocomplete="off"
							/>
							<button type="submit" id='send-message' class="flex-shrink-0 min-w-[3rem] bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-[#1a1712] font-bold px-4 py-2 rounded-lg transition-colors duration-200">
								<img src="/svg/send.svg" class="w-6 h-6 text-xs"/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
}

// Genere le HTML d'un ami dans la sidebar (avatar + nom + statut online/offline)
function renderOneFriend(user: UsersInfo): string {
	return /*ts*/ `
		<li data-username="${user.username}" data-anon="${user.is_anon}"
			class="friend-chat flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-primary-bg)]/80">
			<img src="/uploads/${user.link_avatar}" alt="User" class="w-8 h-8 rounded-full object-cover bg-[var(--color-primary)]"/>
			<div>
				<div class="text-[#d4ced4] font-semibold">
					${user.username}
				</div>
				<div class="text-xs text-[var(--color-primary)]">
					<span class="status-pin w-2 h-2 rounded-full ${user.online ? 'bg-green-400' : 'bg-gray-400'} inline-block border border-[var(--color-primary-bg-dark)]">
					</span>
					<span class="status-text ${user.online ? 'text-green-400' : 'text-gray-400'}">
						${user.online ? 'Online' : 'Offline'}
					</span>
				</div>
			</div>
		</li>
	`;
}

// Point d'entree : charge la liste d'amis et affiche les connectes (ou vue mobile)
export async function populateChat() {
	await populateChatFriends();
	if (isMobile())
		setMobileChatView('friends');
	else
		await populateConnectedUsers();
}

// Charge la liste des amis depuis l'API et l'affiche dans la sidebar
export async function populateChatFriends() {
	try {
		const response: UsersListResponse = await friendsService.getFriends("message", "");
		if (response.success && response.users) {
			const list = document.getElementById('chat-friends-list');
			if (!list)
				return;
			list.innerHTML = response.users.map((user: UsersInfo) => renderOneFriend(user)).join('');
			setupListenersChatFriends();
		}
	}
	catch (error) {
		catchHttpError('Chat view error:', error);
	}
}

// Rafraichit la liste d'amis (apres un block, unfriend, etc.) tout en gardant le chat actif
export async function refreshFriendsListOnAction() {
	const list = document.getElementById('chat-friends-list');
	if (!list)
		return;
	const currentChat = document.querySelector('#general-div.conv-user')?.getAttribute('data-username');
	const currentChannel = document.querySelector('#general-div.conv-user')?.getAttribute('data-channel');

	await populateChatFriends();

	if (currentChat && currentChannel)
		highlightFriend(currentChat);
}

// Ouvre directement la conversation avec un ami precis
export async function populateOneChat(username: string | undefined) {
	if (!username)
		return;
	await populateChatFriends();
	await populateChatWithFriend(username)
}


// <button class="bg-[#c2932d] hover:bg-[var(--color-primary)] text-[#1a1712] font-bold p-1 rounded transition-colors duration-200 text-sm flex items-center gap-1" id="create-group-btn">
// 	<div>
// 		<img src="/svg/add-plus.svg" class="w-6 h-6"/>
// 	</div>
// 	New group
// </button>


// <span id="notif_game" class="flex size-3 hidden">
// 	<span class="h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
// 	<span class="size-3 rounded-full bg-red-500"></span>
// </span>