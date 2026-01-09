
import type { MessageData } from '@shared/types/chat.ts';
import { refreshFriendsListOnAction } from '../components/chat/render.ts';
import { renderOneMessage } from '../components/chat/renderChatRoom.ts';
import { getSocketUser } from '../socket.ts';

async function handleNewMessage(data: any) {

	refreshFriendsListOnAction();

	const div = document.getElementById('general-div');
	if (!div)
		return;
	const channelId = div.getAttribute('data-channel');
	if (!channelId || Number(channelId) !== data.channelId)
		return;
	const username = div.getAttribute('data-username');
	if (!username)
		return;

	const notMe = data.username === username;
	const msgData: MessageData = {
		from: data.username,
		msg: data.message,
		date: data.date,
		type: data.typeMsg
	}
	const msgHtml = renderOneMessage(msgData, notMe);
	div.insertAdjacentHTML('beforeend', msgHtml);
	div.scrollTop = div.scrollHeight;

	const socket = getSocketUser();
	socket?.send(JSON.stringify({
		type: 'chat:read',
		channelId: data.channelId,
	}));
}

export const newMsgHandlers = {
	chat: handleNewMessage
};


async function handleTyping(data: any) {
	console.log(data.type);
	const div = document.getElementById('general-div');
	if (!div)
		return;
	const channelId = div.getAttribute('data-channel');
	if (!channelId || Number(channelId) !== data.channelId)
		return;
	const username = div.getAttribute('data-username');
	if (!username)
		return;
	if (username !== data.username)
		return;

	const indicator = document.getElementById('typing-indicator');
	if (!indicator)
		return;

	indicator.classList.toggle('hidden', !data.typing);
}


export const typingHandlers = {
	chat: handleTyping
};


function onChatRead(data: any) {
	console.log('chat:read');
	const div = document.getElementById('general-div');
	if (!div)
		return;
	const channelId = div.getAttribute('data-channel');
	if (!channelId || Number(channelId) !== data.channelId)
		return;
	const username = div.getAttribute('data-username');
	if (!username)
		return;
	if (username !== data.username)
		return;

	div.querySelectorAll('.read-status').forEach(el => {
		el.textContent = '✓✓ Seen';
	});
}

export const readHandlers = {
	chat: onChatRead
};