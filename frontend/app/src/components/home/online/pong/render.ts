

import { setupListenersInvitationOverlay } from '../listeners.ts'
import { drawLine, drawBall, drawPaddleRight, drawPaddleLeft } from '../../pong/renderPongCanva.ts'
import { navigateTo } from '../../../../main.ts';
import { cleanupOnlinePong } from './clean.ts';
import { createOverlay, createTitle } from '../../../commonLayout.ts';

// revoir les id de btn

export function renderInvitationOverlay(fromUsername: string) {
	if (document.getElementById('invitation-overlay'))
		document.getElementById('invitation-overlay')?.remove();
	const overlay = createOverlay('invitation-overlay');
	if (!overlay)
		return;

	const title = createTitle(`${fromUsername} invited you to play`);

	const buttonsContainer = document.createElement('div');
	buttonsContainer.id = 'btn-container';
	buttonsContainer.classList.add('flex', 'flex-col', 'sm:flex-row', 'gap-4', 'mt-6',
		'w-full', 'px-4', 'sm:px-0', 'justify-center');

	const acceptBtn = document.createElement('button');
	acceptBtn.innerText = "Accept";
	acceptBtn.id = 'accept-game';
	acceptBtn.classList.add('w-full', 'sm:w-auto', 'px-6', 'py-3', 'bg-green-600', 'hover:bg-green-700',
		'text-white', 'rounded-xl', 'font-bold', 'transition');

	const declineBtn = document.createElement('button');
	declineBtn.innerText = "Decline";
	declineBtn.id = 'decline-game';
	declineBtn.classList.add('w-full', 'sm:w-auto', 'px-6', 'py-3', 'bg-red-600', 'hover:bg-red-700', 'text-white',
		'rounded-xl', 'font-bold', 'transition');

	buttonsContainer.appendChild(acceptBtn);
	buttonsContainer.appendChild(declineBtn);

	overlay.appendChild(title);
	overlay.appendChild(buttonsContainer);
	setupListenersInvitationOverlay(fromUsername);
}

export function renderInvitationAcceptedOverlay(fromUsername: string) {
	if (document.getElementById('accepted-invitation-overlay'))
		document.getElementById('accepted-invitation-overlay')?.remove();
	const overlay = createOverlay('accepted-invitation-overlay');
	if (!overlay)
		return;

	const title = createTitle(`${fromUsername} accepted your inviation`);

	const desc = document.createElement('p');
	desc.innerText = 'You have 60s to join the match';
	desc.classList.add('text-lg', 'text-white/80', 'italic', 'mt-6');

	overlay.appendChild(title);
	overlay.appendChild(desc);

	// showNotification(`Time left to join ${fromUsername}: `, true);
}

export function renderWaitingOverlay(username1: string, username2: string) {
	const overlay = document.getElementById('pong-overlay');
	if (!overlay)
		return;

	const comm = document.createElement('div');
	comm.classList.add('text-lg', 'text-[var(--color-primary-light)]/80', 'italic', 'mb-6');
	comm.innerText = "Both players must move to start";

	const readyWrapper = document.createElement('div');
	readyWrapper.classList.add('flex', 'gap-16', 'mb-10');

	readyWrapper.append(createPlayerWrapper(username1), createPlayerWrapper(username2));

	const countdown = document.createElement('div');
	countdown.id = 'countdown';
	countdown.classList.add("text-7xl", 'font-extrabold', 'text-[var(--color-primary-light)]', 'drop-shadow-[0_0_20px_#FFD966]', "mt-2");

	const alone = document.createElement('div');
	alone.id = 'alone';
	alone.className = "text-bold text-gray-500 italic hidden";

	overlay.appendChild(comm);
	overlay.appendChild(readyWrapper);
	overlay.appendChild(countdown);
	overlay.appendChild(alone);
}

// export function renderWinnerOverlay(message: string, p2Username: string) {
export function renderWinnerOverlay(message: string) {
	const overlay = document.getElementById('pong-overlay') as HTMLElement;
	if (!overlay)
		return;

	overlay.innerHTML = '';
	overlay.style.display = 'flex';
	overlay.classList.add('gap-[2rem]');

	const winnerText = document.createElement('div');
	winnerText.innerText = message;
	winnerText.classList.add('text-[5rem]', 'text-[var(--color-primary-light)]', 'font-extrabold', 'transform', 'scale-0', 'transition-transform', 'duration-500', 'ease-out');
	overlay.appendChild(winnerText);

	const buttonsContainer = document.createElement('div');
	buttonsContainer.classList.add('flex', 'gap-4');

	const createButton = (text: string, onClick: () => void) => {
		const btn = document.createElement('button');
		btn.innerText = text;
		btn.classList.add('px-6', 'py-2', 'rounded-xl', 'font-bold', 'border', 'transition-colors', 'duration-200');
		btn.classList.add('border-[var(--color-primary)]', 'text-[var(--color-primary)]');
		btn.classList.add('hover:bg-[var(--color-primary)]', 'hover:text-[#02010f]');
		btn.onclick = onClick;
		return btn;
	};

	const homeButton = createButton('Home', () => {
		cleanupOnlinePong();
		navigateTo('main', 'home');
	});

	// const replayButton = createButton(`New invite to ${p2Username}`, () => {
	// 	// cleanupOnlinePong();
	// 	// start();
	// });

	buttonsContainer.appendChild(homeButton);
	// buttonsContainer.appendChild(replayButton);
	overlay.appendChild(buttonsContainer);


	setTimeout(() => {
		winnerText.classList.remove('scale-0');
		winnerText.classList.add('scale-100');
	}, 50);
}



// Utils

function createPlayerWrapper(username: string): HTMLElement {

	const playerWrapper = document.createElement('div');
	playerWrapper.className = 'flex flex-col items-center justify-center gap-6';

	const player = document.createElement('div');
	// player.dataset.ready = false;
	player.id = `${username}-ready`;
	player.className = 'flex-1 flex flex-col justify-center w-48 px-6 py-4 text-center rounded-xl bg-[#111827] text-xl font-bold text-[var(--color-primary-light)] border-2 border-[var(--color-primary)] opacity-60 transition-all';

	const name = document.createElement('span');
	name.innerText = `${username}`;

	const press = document.createElement('span');
	press.classList.add('text-sm', 'font-normal');
	press.innerText = "Press W/S or ↑/↓";

	player.append(name, press);

	const playerStatus = document.createElement('div');
	playerStatus.classList.add('text-lg', 'text-[var(--color-primary-light)]/80', 'mb-6', 'italic');
	playerStatus.id = `${username}-status`;
	playerStatus.textContent = 'Waiting ...';

	playerWrapper.append(player, playerStatus);

	return playerWrapper;
}

// Match

export function drawGame(canvas: HTMLCanvasElement, match: any) {
	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;

	const scale = canvas.width / 800;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawLine();
	drawBall(ctx, match.ball.pos_x * scale, match.ball.pos_y * scale, match.ball.radius * scale);
	drawPaddleRight(ctx, match.player2.x * scale, match.player2.y * scale, match.player2.width * scale,
		match.player2.height * scale)
	drawPaddleLeft(ctx, match.player1.x * scale, match.player1.y * scale, match.player1.width * scale,
		match.player1.height * scale)
}
