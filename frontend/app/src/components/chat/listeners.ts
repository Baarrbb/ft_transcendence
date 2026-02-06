// ===== CHAT LISTENERS =====
// Ce fichier gere toutes les interactions utilisateur dans le chat :
// - Clic sur un ami pour ouvrir la conversation
// - Envoi de message (bouton ou touche Entree)
// - Indicateur "est en train d'ecrire"
// - Boutons d'invitation de jeu (inviter, accepter, refuser, rejoindre)

import { getSocketUser } from '../../socket.ts';
import { populateChatWithFriend } from './renderChatRoom.ts';
import { showUserStats } from '../profil/showStats.ts';
import { refreshFriendsListOnAction } from './render.ts';
import { inviteStore } from '../../store/inviteStore.ts';
import { sendGameInvite, cancelGameInvite, declineGame, acceptGame, joinRoom } from '../home/online/listeners.ts'
import { navigateTo } from '../../main.ts';

let onFriendClick: ((e: Event) => void) | null = null;

// Listener sur la liste d'amis : quand on clique sur un ami, on ouvre sa conversation
export async function setupListenersChatFriends() {
	const friendsList = document.getElementById('chat-friends-list') as HTMLElement;

	// On enleve l'ancien listener avant d'en mettre un nouveau (evite les doublons)
	if (onFriendClick)
		friendsList?.removeEventListener('click', onFriendClick);

	onFriendClick = async (e: Event) => {
		const target = (e.target as HTMLElement).closest('.friend-chat');
		if (!target)
			return;
		const username = target.getAttribute('data-username');
		if (!username)
			return;
		const div = document.getElementById('general-div');
		if (!div)
			return;
		// Si on etait dans un channel, on envoie un "leave" au serveur via websocket
		const channelId = div.getAttribute('data-channel');
		if (channelId) {
			const socket = getSocketUser();
			socket?.send(JSON.stringify({
				type: 'chat:leave',
				channelId: Number(channelId),
			}));
		}
		await populateChatWithFriend(username); // ouvre la conversation
	}

	friendsList?.addEventListener('click', onFriendClick);
}

let onConnectedUserClick: ((e: Event) => void) | null = null;

// Listener sur la liste des utilisateurs connectes (page hub)
// Clic sur un connecte = ouvre la conversation avec lui
export async function setupListernersConnectedUsers() {
	const connectedList = document.getElementById('general-div');
	if (!connectedList)
		return;

	if (onConnectedUserClick)
		connectedList.removeEventListener('click', onConnectedUserClick);

	onConnectedUserClick = async (e: Event) => {
		const target = (e.target as HTMLElement).closest('.connected-user');
		if (!target)
			return;
		const username = target.getAttribute('data-username');
		if (!username)
			return;
		await populateChatWithFriend(username);
	}
	connectedList.addEventListener('click', onConnectedUserClick);
}


let onChatSend: (() => void) | null = null;
let onChatKeydown: ((e: KeyboardEvent) => void) | null = null;
let onUserClick: (() => void) | null = null;
let onChatTyping: (() => void) | null = null;
let typingTimeout: number | null = null;

// Met en place les listeners pour une conversation specifique :
// - Envoyer un message (clic ou Entree)
// - Indicateur de frappe (typing)
// - Clic sur le username dans le header = affiche ses stats
export async function setupListenersChat(channelId: number, username: string) {
	const chatInput = document.getElementById('chat-input') as HTMLInputElement;
	const sendBtn = document.getElementById('send-message') as HTMLButtonElement;
	const chatHeader = document.getElementById('chat-username');

	if (!channelId)
		return ;

	if (onChatSend)
		sendBtn?.removeEventListener('click', onChatSend);
	if (onChatKeydown)
		chatInput?.removeEventListener('keydown', onChatKeydown);
	if (onUserClick)
		chatHeader?.removeEventListener('click', onUserClick);
	if (onChatTyping)
		chatInput?.removeEventListener('input', onChatTyping);

	// Envoi de message : envoie via websocket et vide le champ
	onChatSend = () => {
		const socket = getSocketUser();
		if (!chatInput?.value)
			return;
		console.log(channelId)
		socket?.send(JSON.stringify({
			type: 'chat:send',
			message: chatInput.value,
			channelId: channelId,
			battle: false
		}));
		chatInput.value = ''; // vide le champ apres envoi
		refreshFriendsListOnAction();
	}
	sendBtn?.addEventListener('click', onChatSend);

	// Touche Entree = envoie le message
	onChatKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (onChatSend)
				onChatSend();
		}
	}
	chatInput?.addEventListener('keydown', onChatKeydown);

	// Indicateur de frappe : previent l'autre qu'on est en train d'ecrire
	// Envoie typing:start, puis typing:stop apres 1.5s d'inactivite
	onChatTyping = () => {
		const socket = getSocketUser();
		// if (!chatInput?.value)
		// 	return;
		console.log(channelId)
		socket?.send(JSON.stringify({
			type: 'typing:start',
			channelId: channelId,
			battle: false
		}));

		if (typingTimeout)
			clearTimeout(typingTimeout);

		typingTimeout = window.setTimeout(() => {
			socket?.send(JSON.stringify({
				type: 'typing:stop',
				username: username,
				channelId: channelId,
			}));
		}, 1500);
	}
	chatInput?.addEventListener('input', onChatTyping);

	// Clic sur le username dans le header = popup avec ses stats
	onUserClick = async () => { await showUserStats(username) }
	chatHeader?.addEventListener('click', onUserClick);
}


// Gere le clic sur les boutons d'invitation de jeu dans le chat
// Detecte l'action (invite, cancel, decline, accept, join) et appelle la bonne fonction
async function handleClick(e: Event) {
	const target = e.target as HTMLElement;
	// let realTarget = target;
	// if (realTarget.tagName === 'IMG' && realTarget.parentElement)
	// 	realTarget = realTarget.parentElement;
	const button = target.closest('button[data-action]');
	if (!button)
		return;
	const btn = button.closest('.game-btn') as HTMLElement;
	if (!btn)
		return;
	const username = btn.dataset.username as string;
	const action = button.getAttribute('data-action');
	const matchId = button.getAttribute('data-match');
	console.log("action:", action);
	console.log("username:", username);
	console.log("matchId:", matchId);
	await actionClick(username, action, matchId);
}

// Execute l'action d'invitation selon le bouton clique
async function actionClick(username: string, action: string | null, matchId: string | null) {
	if (!action)
		return;
	switch (action) {
		case 'invite':
			await sendGameInvite(username);
			break;
		case 'cancel':
			await cancelGameInvite(username);
			break;
		case 'decline':
			await declineGame(username);
			break;
		case 'accept':
			navigateTo('main', 'home', 'online');
			inviteStore.updateInvite(username, 'none', 'received');
			inviteStore.updateInvite(username, 'none', 'occupied');
			await acceptGame(username);
			break;
		case 'join':
			navigateTo('main', 'home', 'online');
			inviteStore.updateInvite(username, 'none', 'accepted');
			if (matchId)
				joinRoom(username, matchId);
			break;
	}
	// refreshFriendsListOnAction();
}

let onHeaderBtnClick: ((e: Event) => void) | null = null;
let onMessageBtnClick: ((e: Event) => void) | null = null;

// Listeners pour les boutons de jeu (header + messages d'invitation dans le chat)
export function setupGameBtnListener() {
	const btn = document.getElementById('header-btn');
	if (!btn)
		return;
	if (onHeaderBtnClick)
		btn.removeEventListener('click', onHeaderBtnClick);
	onHeaderBtnClick = handleClick;
	btn.addEventListener('click', onHeaderBtnClick);

	const inviteMessage = document.getElementById('general-div');
	if (!inviteMessage)
		return;
	if (onMessageBtnClick)
		inviteMessage.removeEventListener('click', onMessageBtnClick);
	onMessageBtnClick = handleClick;
	inviteMessage.addEventListener('click', onMessageBtnClick);
}
