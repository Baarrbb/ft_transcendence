

import { formatDateToLocal } from './utils.ts';
import { renderButtonGame, renderInGameButton } from '../invite/buttons.ts';
import { stringToElement } from '../utils.ts';
import type { UserGameState, InvitationStatus } from '@shared/types/users.ts'


function renderSentInviteMessage(username: string): string {
	return /*ts*/`
		<button data-action="cancel" data-username="${username}"
			class="game-btn px-3 py-1 text-xs font-bold rounded-lg bg-red-700/80 hover:bg-red-600/80 transition cursor-pointer backdrop-blur-sm">
			Cancel
		</button>
	`;
}

function renderInviteAcceptedMessage(username: string, matchId: string | undefined): string {
	return /*ts*/`
		<button data-match="${matchId}" data-action='join' data-username="${username}"
			class="game-btn flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-700 hover:bg-gray-500 transition-colors duration-200 cursor-pointer">
				<span class="leading-none">time left</span>
				<span id='time-left-${username}'></span>
		</button>
	`;
}

function renderReceivedInviteMessage(username: string): string {
	return /*ts*/`
		<div class="flex gap-2">
			<button data-action="accept" data-username="${username}"
				class="game-btn px-3 py-1 text-xs font-bold rounded-lg bg-green-700/80 hover:bg-green-600/80 transition cursor-pointer backdrop-blur-sm">
				Accept
			</button>
			<button data-action="decline" data-username="${username}"
				class="game-btn px-3 py-1 text-xs font-bold rounded-lg bg-gray-600/70 hover:bg-gray-500/70 transition cursor-pointer backdrop-blur-sm">
				Refuse
			</button>
		</div>
	`;
}

function getInviteTitle(sentByMe: boolean, username: string): string {
	return sentByMe 
	? `Invitation sent to <span class="font-semibold text-[var(--color-primary-light)]">${username}</span>`
	: `<span class="font-semibold text-[var(--color-primary-light)]">${username}</span> invites you to play`;
}

export function renderInviteGameMessageFormat(sentByMe: boolean, username: string, status: InvitationStatus, matchId: string | undefined, date: string | number): string {
	const dateFmt = formatDateToLocal(date);

	let actionBtn = '';
	switch (status) {
		case 'sent':
			actionBtn = renderSentInviteMessage(username);
			break;
		case 'received':
			actionBtn = renderReceivedInviteMessage(username);
			break;
		case 'occupied':
			actionBtn = renderInGameButton();
			break;
		case 'accepted':
			actionBtn = renderInviteAcceptedMessage(username, matchId);
			break;
		default:
			return '';
	}

	const alignItems = sentByMe ? 'items-end' : 'items-start';
	const textAlign = sentByMe ? 'text-right' : 'text-left';
	const dateAlign = sentByMe ? 'ml-auto' : 'mr-2';

	return /*ts*/`
		<div id='in-chat-invite' data-username="${username}" class="flex flex-col w-full ${alignItems}">
			<div class="bg-black/80 backdrop-blur-md border border-[var(--color-primary)] rounded-2xl shadow-[0_0_20px_rgba(170,128,36,0.3)] px-6 py-5 my-3 text-[#e8e3da] max-w-sm w-fit ${textAlign}">
				<div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent blur-sm"></div>
				<div class="relative z-10">
					<div class="flex items-center justify-center gap-3 mb-4 text-center">
						<div class="p-2 bg-[var(--color-primary)]/20 rounded-full">
							<img src="/svg/ping-pong.svg" class="w-6 h-6" alt="Pong"/>
						</div>
						<div class="text-base font-medium">
							${getInviteTitle(sentByMe, username)}
						</div>
					</div>
					<div class="btn-invite flex justify-center">
						${actionBtn}
					</div>
				</div>
			</div>
			<span class="text-xs text-[var(--color-primary)] ${dateAlign}">
				${dateFmt}
			</span>
		</div>
	`;
}

export function updateInviteMessage(user: UserGameState) {

	const divUser = document.getElementById('general-div')?.getAttribute('data-username');
	if (divUser !== user.username)
		return;
	const msg = document.getElementById('in-chat-invite');
	if (!msg) {
		const div = document.getElementById('general-div');
		if (!div)
			return;
		const me = user.invite === 'sent' ? true : false;
		div.insertAdjacentElement('beforeend', stringToElement(renderInviteGameMessageFormat(me, user.username, user.invite, user.matchId, Date.now())));
		div.scrollTop = div.scrollHeight;
		return;
	}
	const btnInvite = msg.querySelector('.btn-invite');
	if (!btnInvite)
		return ;

	switch (user.invite) {
		case 'sent':
			btnInvite.innerHTML = renderSentInviteMessage(user.username);
			break;
		case 'received':
			btnInvite.innerHTML = renderReceivedInviteMessage(user.username);
			break;
		case 'occupied':
			btnInvite.innerHTML = renderInGameButton();
			break;
		case 'accepted':
			btnInvite.innerHTML = renderInviteAcceptedMessage(user.username, user.matchId);
			break;
		default:
			msg.remove();
			break;
	}
}

export function updateGameStatus(user: UserGameState) {
	const chatHeaderUser = document.getElementById('chat-header')?.getAttribute('data-username');
	if (chatHeaderUser !== user.username)
		return;
	const btn = document.getElementById('header-btn');
	if (!btn)
		return;
	btn.innerHTML = renderButtonGame(user.invite, user.username);
}
