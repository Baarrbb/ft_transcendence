
import type { LocalGame } from './localGameType.ts';
import { start, cleanupPong } from '../localMode/play1v1.ts';
import { moves } from './game.ts'
import { drawLine, drawBall, drawPaddleRight, drawPaddleLeft } from '../pong/renderPongCanva.ts'
import { navigateTo } from '../../../main.ts';


function resetBall(game: LocalGame, direction: number) {
	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (!canvas)
		return;

	game.ball.pos_x = canvas.width / 2;
	game.ball.pos_y = canvas.height / 2;

	const speed = 5;
	game.ball.dir_x = speed * direction;
	game.ball.dir_y = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 2);
}

function updateScore(game: LocalGame) {
	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (!canvas)
		return;

	if (game.ball.pos_x >= canvas.width) {
		game.score.left++;
		resetBall(game, -1);
		if (game.score.left >= game.scoreMax) {
			game.winner = game.player1;
			game.loser = game.player2;
		}
	}

	else if (game.ball.pos_x <= 0) {
		game.score.right++;
		resetBall(game, +1);
		if (game.score.right >= game.scoreMax) {
			game.winner = game.player2;
			game.loser = game.player1;
		}
	}
}

function drawScore(game: LocalGame) {
	const scoreLeft = document.getElementById('score-left') as HTMLElement;
	const scoreRight = document.getElementById('score-right') as HTMLElement;

	if (scoreLeft)
		scoreLeft.innerText = String(game.score.left);
	if (scoreRight)
		scoreRight.innerText = String(game.score.right);
}

export function draw(game: LocalGame) {
	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (!canvas)
		return;
	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawLine();
	drawBall(ctx, game.ball.pos_x, game.ball.pos_y, game.ball.radius);
	drawPaddleRight(ctx, game.paddles.right.pos_x, game.paddles.right.pos_y, game.paddles.right.width, game.paddles.right.height);
	drawPaddleLeft(ctx, game.paddles.left.pos_x, game.paddles.left.pos_y, game.paddles.left.width, game.paddles.left.height);

	updateScore(game);
	drawScore(game);
	moves(game);
}

export function cleanupOverlay() {
	const overlay = document.getElementById('pong-overlay');
	if (!overlay)
		return;
	overlay.style.display = 'none';
}


export function renderWaitingOverlay(p1: string, p2: string) {
	const overlay = document.getElementById('pong-overlay');
	if (!overlay)
		return;

	const comm = document.createElement('div');
	comm.classList.add('text-lg', 'text-[var(--color-primary-light)]/80', 'italic', 'mb-6');
	comm.innerText = "Both players must move to start";

	const readyWrapper = document.createElement('div');
	readyWrapper.classList.add('flex', 'gap-16', 'mb-10');
	
	const player1 = document.createElement('div');
	player1.id = "player1-ready";
	player1.classList.add('flex-1', 'flex', 'flex-col', 'justify-center', 'w-48', 'px-6', 'py-4', 'text-center', 'rounded-xl', 'bg-[#111827]', 'text-xl', 'font-bold', 'text-[var(--color-primary-light)]', 'border-2', 'border-[var(--color-primary)]', 'opacity-60', 'transition-all');
	const name1 = document.createElement('span');
	name1.innerText = p1;

	const press = document.createElement('span');
	press.classList.add('text-sm', 'font-normal');
	press.innerText = "Press W/S";

	player1.appendChild(name1);
	player1.appendChild(press);

	const player2 = document.createElement('div');
	player2.id = "player2-ready";
	player2.classList.add('flex-1', 'flex', 'flex-col', 'justify-center', 'w-48', 'px-6', 'py-4', 'text-center', 'rounded-xl', 'bg-[#111827]', 'text-xl', 'font-bold', 'text-[var(--color-primary-light)]', 'border-2', 'border-[var(--color-primary)]', 'opacity-60', 'transition-all');
	const name2 = document.createElement('span');
	name2.innerText = p2;

	const press2 = document.createElement('span');
	press2.classList.add('text-sm', 'font-normal');
	press2.innerText = "Press ↑/↓";

	player2.appendChild(name2);
	player2.appendChild(press2);

	readyWrapper.appendChild(player1);
	readyWrapper.appendChild(player2);

	const countdown = document.createElement('div');
	countdown.id = 'countdown';
	countdown.classList.add("text-7xl", 'font-extrabold', 'text-[var(--color-primary-light)]', 'drop-shadow-[0_0_20px_#FFD966]', "mt-2");

	overlay?.appendChild(comm);
	overlay?.appendChild(readyWrapper);
	overlay?.appendChild(countdown);
}

import type { Tournament } from './localGameType.ts';
import { renderMatchesTournament, setupListenersPlayMatch } from '../tournament/localTournament/renderLocalTournament.ts';

export function renderWinnerOverlay(game: LocalGame, tournament: boolean, tournmt?: Tournament) {
	const overlay = document.getElementById('pong-overlay') as HTMLElement;
	if (!overlay)
		return;

	overlay.innerHTML = '';
	overlay.style.display = 'flex';
	overlay.classList.add('gap-[2rem]');

	const winnerText = document.createElement('div');
	winnerText.innerText = game.winner + " WINS!";
	winnerText.classList.add('text-[5rem]', 'text-[var(--color-primary-light)]', 'font-extrabold', 'transform', 'scale-0', 'transition-transform', 'duration-500', 'ease-out');
	overlay.appendChild(winnerText);

	const buttonsContainer = document.createElement('div');
	buttonsContainer.classList.add('flex', 'gap-4');

	const createButton = (text: string, onClick: () => void) => {
		const btn = document.createElement('button');
		btn.innerText = text;
		btn.classList.add('px-6', 'py-2', 'rounded-xl', 'font-bold', 'border', 'transition-colors', 'duration-200');
		btn.classList.add('border-[var(--color-primary)]', 'text-[var(--color-primary)]');
		btn.classList.add('hover:bg-[var(--color-primary)]', 'hover:text-[#02010f]', 'cursor-pointer');
		btn.onclick = onClick;
		return btn;
	};

	if (!tournament) {
		const homeButton = createButton('Home', () => navigateTo('main', 'home') );
		const replayButton = createButton('Restart', () => start(game.player1, game.player2, game.isBotGame) );
		buttonsContainer.appendChild(homeButton);
		buttonsContainer.appendChild(replayButton);
	}
	else {
		const backTournament = createButton('Back', () => {
			const main = document.getElementById('main-content') as HTMLElement | null;
			if (main) {
				setTimeout(() => setupListenersPlayMatch(tournmt!), 0);
				main.innerHTML = renderMatchesTournament(tournmt!);
			}
		});
		buttonsContainer.appendChild(backTournament);
	}

	overlay.appendChild(buttonsContainer);

	setTimeout(() => {
		winnerText.classList.remove('scale-0');
		winnerText.classList.add('scale-100');
	}, 50);

}

export function renderPauseGame(game: LocalGame) {
	const overlay = document.getElementById('pong-overlay') as HTMLElement;
	if (!overlay)
		return;

	game.ballPause = !game.ballPause
	game.paddlesPause = !game.paddlesPause
	game.pause = !game.pause
	if (!game.pause) {
		overlay.style.display = 'none';
		return ;
	}

	overlay.innerHTML = '';
	overlay.style.display = 'flex';
	overlay.classList.add('gap-[2rem]');

	const title = document.createElement('div');
	title.innerText = 'PAUSE';
	title.classList.add('text-[4rem]', 'text-[var(--color-primary-light)]', 'font-extrabold');
	overlay.appendChild(title);

	const buttonsContainer = document.createElement('div');
	buttonsContainer.classList.add('flex', 'flex-col', 'gap-4', 'items-center');

	const createMenuButton = (text: string, onClick: () => void) => {
		const btn = document.createElement('button');
		btn.innerText = text;
		btn.classList.add('cursor-pointer', 'px-6', 'py-2', 'rounded-xl', 'font-bold', 'border', 'transition-colors', 'duration-200');
		btn.classList.add('border-[var(--color-primary)]', 'text-[var(--color-primary)]');
		btn.classList.add('hover:bg-[var(--color-primary)]', 'hover:text-[#02010f]');
		btn.onclick = onClick;
		return btn;
	};

	const resumeBtn = createMenuButton('Resume', () => {
		renderPauseGame(game);
	});

	buttonsContainer.appendChild(resumeBtn);

	if (!game.isTournament) {
		const homeBtn = createMenuButton('Home', () => {
			cleanupPong();
			navigateTo('main', 'home');
		});
		const restartBtn = createMenuButton('Restart', () => {
			cleanupPong();
			start(game.player1, game.player2, game.isBotGame);
		});
			buttonsContainer.appendChild(restartBtn);
		buttonsContainer.appendChild(homeBtn);
	}

	overlay.appendChild(buttonsContainer);
}

let resizeHandler: (() => void) | null = null;

export function resizeListeners(game: LocalGame) {
	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;

	if (resizeHandler)
		window.removeEventListener('resize', resizeHandler);

	resizeHandler = () => {
		const oldCanva = {
			height: canvas.height,
			width: canvas.width
		}
		const parent = canvas.parentElement!;
		const maxWidth = parent.clientWidth;
		const maxHeight = parent.clientHeight;
		let canvasWidth = maxWidth;
		let canvasHeight = maxWidth * 9 / 16;
		if (canvasHeight > maxHeight) {
			canvasHeight = maxHeight;
			canvasWidth = maxHeight * 16 / 9;
		}
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		game.paddles.right.height = canvas.height / 5
		game.paddles.right.width = canvas.width / 48
		game.paddles.left.height = canvas.height / 5
		game.paddles.left.width = canvas.width / 48
		game.paddles.left.pos_x = 0
		game.paddles.right.pos_x = canvas.width - canvas.width / 48
		game.ball.radius = canvas.width / 80
		game.ball.pos_x = (game.ball.pos_x * canvas.width) / oldCanva.width
		game.ball.pos_y = (game.ball.pos_y * canvas.height) / oldCanva.height
	}

	window.addEventListener('resize', resizeHandler);
}

export function cleanResizeHandler() {
	if (resizeHandler)
		window.removeEventListener('resize', resizeHandler);
	resizeHandler = null;
}
