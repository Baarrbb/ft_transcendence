
import { renderWaitingOverlay, renderPauseGame } from './render.ts'
import type { LocalGame } from '../pongLocal/localGameType.ts';
import { botUpdate } from '../localMode/bot.ts';

// Typer ttes les fonctions avec game : LocalGame

export function initGame(p1: string, p2: string, isTournament: boolean, isBot: boolean = false) {
	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (!canvas)
		return;

	const parent = canvas.parentElement!;
	const maxWidth = parent.clientWidth;
	const maxHeight = parent.clientHeight;
	// Forcer ratio 16:9
	let canvasWidth = maxWidth;
	let canvasHeight = maxWidth * 9 / 16;
	if (canvasHeight > maxHeight) {
		canvasHeight = maxHeight;
		canvasWidth = maxHeight * 16 / 9;
	}
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	const game: LocalGame = {
		isBotGame: isBot,
		botState: {
			targetY: null,
			reactionTimer: 0,
			lastRefreshTime: undefined
		},
		botDifficulty: 1,

		isTournament: isTournament,
		player1: p1,
		player2: p2,
		winner: undefined,
		loser: undefined,
		scoreMax: 3,
		pause: false,
		paddlesPause : false,
		ballPause : true,
		start: false,
		intro: false,
		score: {
			right: 0,
			left: 0
		},
		playersReady: {
			player1: false,
			player2: false
		},
		ball: {
			radius: canvas.width / 80,
			pos_x: canvas.width / 2,
			pos_y: canvas.height / 2,
			dir_x: dirBallX(),
			dir_y: dirBallY()
		},
		paddles: {
			right: {
				height: canvas.height / 5,
				width: canvas.width / 48,
				pos_x: canvas.width - canvas.width / 48,
				pos_y: (canvas.height - canvas.height / 4) / 2,
				upPressed: false,
				downPressed: false,
			},
			left: {
				height: canvas.height / 5,
				width: canvas.width / 48,
				pos_x: 0,
				pos_y: (canvas.height - canvas.height / 4) / 2,
				upPressed : false,
				downPressed : false,
			}
		},
	}
	return game;
}

let keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
let keyUpHandler: ((e: KeyboardEvent) => void) | null = null;

export function cleanupListeners() {
	cleanupPaddlesListeners();
	cleanupPauseListener();
	cleanupWaitListener();
}

function cleanupPaddlesListeners() {
	if (keyDownHandler)
		document.removeEventListener('keydown', keyDownHandler);
	if (keyUpHandler)
		document.removeEventListener('keyup', keyUpHandler);
	keyDownHandler = null;
	keyUpHandler = null;
}

export function setupListenersGame1v1(game: LocalGame) {

	cleanupPaddlesListeners();

	keyDownHandler = function (e) {
		if (game.isBotGame) {
			if(e.key === "Up" || e.key === "ArrowUp")
				game.paddles.left.upPressed = true
			else if(e.key === "Down" || e.key === "ArrowDown")
				game.paddles.left.downPressed = true
			else if(e.key === "w")
				game.paddles.left.upPressed = true
			else if(e.key === "s")
				game.paddles.left.downPressed = true
		}
		else {
			if(e.key === "Up" || e.key === "ArrowUp")
				game.paddles.right.upPressed = true
			else if(e.key === "Down" || e.key === "ArrowDown")
				game.paddles.right.downPressed = true
			else if(e.key === "w")
				game.paddles.left.upPressed = true
			else if(e.key === "s")
				game.paddles.left.downPressed = true
		}
	}

	keyUpHandler = function (e) {
		if (game.isBotGame) {
			if(e.key === "Up" || e.key === "ArrowUp")
				game.paddles.left.upPressed = false
			else if(e.key === "Down" || e.key === "ArrowDown")
				game.paddles.left.downPressed = false
			else if(e.key === "w")
				game.paddles.left.upPressed = false
			else if(e.key === "s")
				game.paddles.left.downPressed = false
		}
		else {
			if(e.key === "Up" || e.key === "ArrowUp")
				game.paddles.right.upPressed = false
			else if(e.key === "Down" || e.key === "ArrowDown")
				game.paddles.right.downPressed = false
			else if(e.key === "w")
				game.paddles.left.upPressed = false
			else if(e.key === "s")
				game.paddles.left.downPressed = false
		}
	}

	document.addEventListener('keydown', keyDownHandler);
	document.addEventListener('keyup', keyUpHandler);
}

let pauseKeyHandler: ((e: KeyboardEvent) => void) | null = null;
let pauseClickHandler: ((e: Event) => void) | null = null;

function cleanupPauseListener() {
	if (pauseKeyHandler)
		document.removeEventListener('keydown', pauseKeyHandler);
	const pauseBtn = document.getElementById('pause-btn');
	if (pauseClickHandler)
		pauseBtn?.removeEventListener('click', pauseClickHandler);
	pauseKeyHandler = null;
	pauseClickHandler = null;
}

function setupListenersPause(game: LocalGame) {
	cleanupPauseListener();
	pauseKeyHandler = function (e: KeyboardEvent) {
		if (e.repeat)
			return;
		if(e.key === "Escape" || e.code === "Space") {
			e.preventDefault();
			renderPauseGame(game);
		}
	}
	document.addEventListener('keydown', pauseKeyHandler);
	const pauseBtn = document.getElementById('pause-btn');
	pauseClickHandler = function () {
		renderPauseGame(game);
	}
	pauseBtn?.addEventListener('click', pauseClickHandler);
}

function dirBallX() {
	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (!canvas)
		return;
	let dirX: number = canvas.width / 250;
	if (Math.floor(Math.random() * 2))
		dirX *= -1;

	return dirX;
}

function dirBallY() {
	let dirY: number = Math.floor(Math.random() * 5)
	if (Math.floor(Math.random() * 2))
		dirY *= -1;

	return dirY;
}

function setReady(id: string, text: string, game: LocalGame) {
	const player = document.getElementById(id) as HTMLElement;
	if (!player)
		return;
	player.innerHTML = text;
	player.classList.remove('opacity-60')
	player.classList.add('opacity-100', 'bg-[var(--color-primary-light)]/20', 'shadow-lg');

	if (id === 'player1-ready')
		game.playersReady.player1 = true;
	else if (id === 'player2-ready')
		game.playersReady.player2 = true;

	if (game.playersReady.player1 && game.playersReady.player2)
		startCountdown(game);
}

let waitListeners: ((e: KeyboardEvent) => void) | null = null;

function cleanupWaitListener() {
	if (waitListeners)
		document.removeEventListener('keydown', waitListeners);
	waitListeners = null;
}

export function waitPlayers(game: LocalGame, p1: string, p2: string) {

	renderWaitingOverlay(p1, p2);
	cleanupWaitListener();

	if (game.playersReady.player2)
		setReady('player2-ready', `${p2} ready`, game);

	waitListeners = function (e) {
		if (!game.playersReady.player2) {
			if(e.key === "Up" || e.key === "ArrowUp" || e.key === "Down" || e.key === "ArrowDown")
				setReady('player2-ready', `${p2} ready`, game);
		}
		if (!game.playersReady.player1){
			if(e.key === "w" || e.key === "s")
				setReady('player1-ready', `${p1} ready`, game);
		}
	}

	document.addEventListener('keydown', waitListeners);
}

let countdownInterval: number | null = null;

function startCountdown(game: LocalGame) {
	if (game.intro)
		return;
	game.intro = true;
	const countdown = document.getElementById('countdown') as HTMLElement;
	if (!countdown)
		return;

	let time = 3;
	countdown.textContent = time.toString();

	// const interval = setInterval(() => {
	countdownInterval = setInterval(() => {
		console.log('icic intergval de wait playes', countdownInterval);
		time--;
		if (time > 0) {
			countdown.textContent = time.toString();
		} else {
			cleanCountDown();
			countdown.textContent = '';
			const overlay = document.getElementById('pong-overlay') as HTMLElement;
			if (overlay)
				overlay.style.display = 'none';

			game.start = true;
			game.ballPause = false;
			setupListenersPause(game);
		}
	}, 1000);
}

export function cleanCountDown() {
	if (countdownInterval) {
		clearInterval(countdownInterval);
		countdownInterval = null;
	}
}

export function moves(game: LocalGame) {
	if (game.isBotGame)
		botUpdate(game);

	if(!game.paddlesPause)
		paddlesMove(game)
	if(!game.ballPause) {
		game.ball.pos_x += game.ball.dir_x!;
		game.ball.pos_y += game.ball.dir_y;
	}
	ballCollision(game)
}

function paddlesMove(game: LocalGame) {
	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (!canvas)
		return;
	if (game.paddles.right.upPressed)
		game.paddles.right.pos_y = Math.max(game.paddles.right.pos_y - canvas.height / 90, 0)
	else if (game.paddles.right.downPressed)
		game.paddles.right.pos_y = Math.min(game.paddles.right.pos_y + canvas.height / 90, canvas.height - game.paddles.right.height)

	if (game.paddles.left.upPressed)
		game.paddles.left.pos_y = Math.max(game.paddles.left.pos_y - canvas.height / 100, 0)
	else if (game.paddles.left.downPressed)
		game.paddles.left.pos_y = Math.min(game.paddles.left.pos_y + canvas.height / 100, canvas.height - game.paddles.left.height)
}

// a revoir

function isTherePaddles(game: LocalGame) {
	if (game.ball.dir_x! > 0 && game.ball.pos_y >= game.paddles.right.pos_y && game.ball.pos_y <= (game.paddles.right.pos_y + game.paddles.right.height))
		return true;
	else if (game.ball.dir_x! < 0 && game.ball.pos_y >= game.paddles.left.pos_y && game.ball.pos_y <= (game.paddles.left.pos_y + game.paddles.left.height))
		return true;
	return(false)
}

function ballCollision(game: LocalGame) {
	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (game.ball.pos_y + game.ball.dir_y > canvas.height - game.ball.radius || game.ball.pos_y + game.ball.dir_y < game.ball.radius) {
		game.ball.dir_y = -game.ball.dir_y
	}
	else if (game.ball.pos_x > canvas.width - (game.paddles.right.width  + game.ball.radius) || game.ball.pos_x < (game.ball.radius + game.paddles.left.width)) {
		if (isTherePaddles(game)) {
			game.ball.dir_x = -game.ball.dir_x!;
			let paddle;
			let angle = 0.8;
			if (game.ball.dir_x > 0)
				paddle = game.paddles.right;
			else
				paddle = game.paddles.left;
			let ballXPaddle = game.ball.pos_y - paddle.pos_y;
			let paddleCenter = paddle.height / 2;
			let redirY = (ballXPaddle - paddleCenter) / paddleCenter;
			let constSpeed = Math.sqrt(game.ball.dir_x ** 2 + game.ball.dir_y ** 2);

			game.ball.dir_y = redirY * angle;

			let scale = Math.sqrt(game.ball.dir_x ** 2 + game.ball.dir_y ** 2);
			game.ball.dir_x = (game.ball.dir_x / scale) * constSpeed;
			game.ball.dir_y = (game.ball.dir_y / scale) * constSpeed;
			game.ball.dir_y = redirY * 2
		}
	}
}

