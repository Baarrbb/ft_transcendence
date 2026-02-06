// ===== CHAT ROOM =====
// Ce fichier gere l'affichage d'une conversation avec un ami :
// - Le header (nom + status online + indicateur de frappe)
// - L'historique des messages
// - Les invitations de jeu dans le chat
// - L'envoi/reception de messages via websocket

import type { UserGameState, InvitationStatus } from '@shared/types/users.ts'
import type { MessageData, ChannelInfo, ChatHistory } from '@shared/types/chat.ts'
import { catchHttpError } from '../../utils/catchError.ts';
import { highlightFriend, formatDateToLocal } from './utils.ts';
import { inviteStore } from '../../store/inviteStore.ts';
import { matchService } from '../../services/match.ts';
import { chatService } from '../../services/chat.ts';
import { isMobile, refreshFriendsListOnAction, setMobileChatView } from './render.ts';
import { setupGameBtnListener } from './listeners.ts';
import { getSocketUser } from '../../socket.ts';
import { updateInviteMessage, updateGameStatus, renderInviteGameMessageFormat } from './renderGameInviteInChat.ts'
import { setupListenersChat } from './listeners.ts';

// Configure le header de la conversation (nom, status, bouton retour sur mobile)
async function setChatHeaderAndInput(username: string, online: boolean) {
	try {
		const backBtn = document.getElementById('back-header-btn');
		if (!backBtn) 
			return;
		if (isMobile()) {
			backBtn?.classList.remove('hidden');
			backBtn.innerHTML = `
				<button id="chat-back" class="text-[var(--color-primary)] text-lg">
					←
				</button>
			`;
			document.getElementById('chat-back')?.addEventListener('click', () => {
				setMobileChatView('friends');
			});
		}
		else
			backBtn.classList.add('hidden');

		const chatHeaderUser = document.getElementById('chat-header') as HTMLElement;
		if (!chatHeaderUser)
			return;

		chatHeaderUser.setAttribute('data-username', username);

		chatHeaderUser.innerHTML = `
			<div data-username=${username} class="chat-user-info flex flex-col items-center gap-1">
				<div class="flex items-center gap-2">
					<span class="status-pin w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-gray-400'}"></span>
					<span id="chat-username">${username}</span>
				</div>
				<span id="typing-indicator" class="text-xs text-[var(--color-primary)] hidden">
					is typing...
				</span>
			</div>
		`;

		const chatInputZone = document.getElementById('chat-input-zone');
		if (!chatInputZone)
			return;
		chatInputZone.classList.remove('hidden');

		const chatInput = document.getElementById('chat-input') as HTMLInputElement;
		chatInput?.focus();

		const btn = document.getElementById('header-btn');
		if (!btn)
			return;
		btn.classList.remove('hidden');

	}
	catch (error) {
		catchHttpError('Send game invite:', error);
	}
}

// Fonction principale : ouvre la conversation avec un ami
// 1) Surligne l'ami dans la sidebar
// 2) Configure le header
// 3) Gere le statut d'invitation de jeu
// 4) Charge l'historique des messages
export async function populateChatWithFriend(username: string | null) {
	if (!username)
		return;

	if (isMobile())
		setMobileChatView('chat');

	highlightFriend(username);

	const userDivList = document.querySelector(`.friend-chat[data-username=${username}]`);
	if (!userDivList)
		return;
	const status = userDivList.querySelector('.status-pin');
	const online = status?.classList.contains('bg-green-400') ?? false;

	setChatHeaderAndInput(username, online);

	const isAnon = userDivList.getAttribute("data-anon");
	if (isAnon === "1") {
		const chatInputZone = document.getElementById('chat-input-zone');
		chatInputZone?.classList.add('hidden');
		const btn = document.getElementById('header-btn');
		btn?.classList.add('hidden');
	}

	const inviteStatus: any = await matchService.getInvitationStatus(username);
	if (!inviteStatus.invite)
		return;
	const userState = inviteStore.getFriend(username);
	if (!userState) {
		const user: UserGameState = {
			username,
			online,
			friend: true,
			invite: inviteStatus.invite,
			matchId: inviteStatus.matchId
		}
		inviteStore.addFriend(user);
		updateGameStatus(user);
	}
	else {
		userState.invite = inviteStatus.invite;
		updateGameStatus(userState);
	}
	inviteStore.subscribe(username, updateGameStatus);
	inviteStore.subscribe(username, updateInviteMessage);
	inviteStore.subscribe(username, refreshFriendsListOnAction);

	try {
		const response: ChannelInfo = await chatService.channelInfo(username);
		if (!response.success)
			return;
		const channelId = response.channel_id;
		await populateChatHistory(channelId, username);
	}
	catch (error) {
		catchHttpError('Chat render error:', error);
	}

	setupGameBtnListener();
}

// Genere le HTML d'un seul message (aligne a gauche si c'est l'autre, a droite si c'est moi)
// Affiche aussi la date et le statut lu/envoye
export function renderOneMessage(msgData: MessageData, notMe: boolean): string {
	const date = formatDateToLocal(msgData.date)
	return /*ts*/`
		<div class="flex w-full min-w-0 flex-col items-${notMe ? 'start' : 'end'}">
			<div class="max-w-[85%] min-w-0 px-4 py-2 rounded-lg mb-1 break-words overflow-wrap-anywhere
				${notMe ? 'bg-[var(--color-primary-bg)]/80 text-[#d4ced4]' : 'self-end bg-[var(--color-primary-light)]/90 text-[#1a1712]'}">
				${msgData.msg}
			</div>
			<span class="text-xs text-[var(--color-primary)] ${notMe ? 'mr-2' : 'self-end'}">
				${notMe ? msgData.from : 'Moi'} • ${date}
			</span>
			${!notMe ? `
				<span class="text-[10px] text-[var(--color-primary)] self-end read-status">
					${msgData.read ? '✓✓ Seen' : '✓ Sent'}
				</span>
			` : ''}
		</div>
	`;
}

// Charge l'historique des messages d'un channel et les affiche
// Rejoint aussi le channel via websocket pour recevoir les nouveaux messages en temps reel
async function populateChatHistory(channelId: number, username: string) {
	if (!channelId)
		return;
	const div = document.getElementById('general-div');
	if (!div)
		return;
	div.classList.remove('connected-friends');
	div.classList.add('conv-user');
	div.setAttribute('data-username', username);
	div.setAttribute('data-channel', channelId.toString());
	const history: ChatHistory = await chatService.chatHistory(channelId);
	if (history.success && history.messages) {
		div.innerHTML = history.messages.map((msgData: MessageData) => {
			const notMe = msgData.from === username;
			if (msgData.type === 'message')
				return renderOneMessage(msgData, notMe);
			else
				return renderInviteGameMessageFormat(!notMe, username, msgData.typeInvite as InvitationStatus, msgData.matchId, msgData.date);
		}).join('');
		div.scrollTop = div.scrollHeight;

		const socket = getSocketUser();
		socket?.send(JSON.stringify({
			type: 'chat:join',
			channelId: channelId,
		}));
	}
	setupListenersChat(channelId, username);
}
