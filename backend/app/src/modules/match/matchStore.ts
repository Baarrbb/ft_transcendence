
import matchService from './match.service.ts';
// import dbUsers from '../users/users.model.ts';
import { WebSocket } from 'ws';

// import { randomUUID } from 'crypto';

// export const matchSockets: Map<string, WebSocket[]> = new Map();
export const matchSockets: Map<string, MatchSocket[]> = new Map();

const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
const TIME_TO_BE_IN = 60;

interface MatchSocket {
	socket: WebSocket;
	username: string;
}

interface PlayerState {
	username: string;
	x: number;
	y: number;
	direction: number;
	width: number;
	height: number;
	score: number;
	inRoom: boolean;
	isReady: boolean;
}

interface BallState {
	pos_x: number;
	pos_y: number;
	radius: number;
	velocityX: number;
	velocityY: number;
}

interface MatchState {
	matchId: string;
	player1: PlayerState;
	player2: PlayerState;
	ball: BallState;
	running: boolean;
	countdown: boolean;
}

const matches: Map<string, MatchState> = new Map();

export function createMatch(matchId: string, player1: string, player2: string) {

	const defaultPlayer1: Omit<PlayerState, "username"> = {
		x: 0,
		y: (GAME_HEIGHT - GAME_HEIGHT / 4) / 2,
		direction: 0,
		width: GAME_WIDTH / 48,
		height: GAME_HEIGHT / 5,
		score: 0,
		inRoom: false,
		isReady: false
	};

	const defaultPlayer2: Omit<PlayerState, "username"> = {
		x: GAME_WIDTH - GAME_WIDTH / 48,
		y: (GAME_HEIGHT - GAME_HEIGHT / 4) / 2,
		direction: 0,
		width: GAME_WIDTH / 48,
		height: GAME_HEIGHT / 5,
		score: 0,
		inRoom: false,
		isReady: false
	};

	const defaultBall: BallState = {
		pos_x: GAME_WIDTH / 2,
		pos_y: GAME_HEIGHT / 2,
		radius: GAME_WIDTH / 80,
		velocityX: 4,
		velocityY: 4
	};

	const match: MatchState = {
		matchId,
		player1: {
			username: player1,
			...defaultPlayer1
		},
		player2: {
			username: player2,
			...defaultPlayer2,
		},
		ball: defaultBall,
		running: false,
		countdown: false
	}
	matches.set(matchId, match);
}

export function setPlayerInRoom(matchId: string, username: string) {
	if (!matches.get(matchId))
		return;
	const match = matches.get(matchId);
	if (match.player1.username === username)
		match.player1.inRoom = true;
	if (match.player2.username === username) 
		match.player2.inRoom = true;

	const payload = {
		type: 'room:update',
		player1: {
			username: match.player1.username,
			inRoom: match.player1.inRoom,
			isReady: match.player1.isReady
		},
		player2: {
			username: match.player2.username,
			inRoom: match.player2.inRoom,
			isReady: match.player2.isReady
		},
		match
	}
	broadcastMatchState(matchId, payload);
}



export function startCountdown(matchId: string, username: string) {
	const match = matches.get(matchId);
	if (!match)
		return;
	// let player: PlayerState;
	let usernameWaiting: string;
	if (match.player1.username === username)
		usernameWaiting = match.player2.username;
	else
		usernameWaiting = match.player1.username;

	let countdown = TIME_TO_BE_IN;
	const interval = setInterval(() => {
		if (countdown > 0) {
			broadcastMatchState(matchId, {
				type: 'player:waiting',
				inRoom: usernameWaiting,
				outRoom: username,
				seconds: countdown,
				match
			});
			countdown--;
			if (match.player1.inRoom && match.player2.inRoom) {
				clearInterval(interval);
				broadcastMatchState(matchId, { type: 'game:ready', match });
			}
		}
		else {
			clearInterval(interval);
			matchService.removeInvitation(match.player1.username, match.player2.username);
			match.player1.inRoom = false;
			match.player2.inRoom = false;
		}
	}, 1000);
	matchIntervals.set(matchId, { countdownNotIn: interval });
}

function updatePaddles(match: MatchState) {
	const speed = 10;
	[match.player1, match.player2].forEach(player => {
		if (player.direction) {
			player.y += player.direction * speed;
			if (player.y < 0)
				player.y = 0;
			if (player.y + player.height > GAME_HEIGHT)
				player.y = GAME_HEIGHT - player.height;
		}
	});
}

interface MatchIntervals {
	countdownNotIn?: NodeJS.Timeout;
	countdown?: NodeJS.Timeout;
	gameLoop?: NodeJS.Timeout;
}

const TICK_RATE = 16;
const matchIntervals: Map<string, MatchIntervals> = new Map();

export function playerMove(matchId: string, username: string, direction: number) {

	// console.log("playerMove", username, "direction:", direction);
	const match = matches.get(matchId);
	if (!match)
		return;
	let player: PlayerState;
	if (match.player1.username === username)
		player = match.player1;
	else
		player = match.player2;

	player.direction = direction
	updatePaddles(match);

	if (!player.isReady && direction != 0) {
		player.isReady = true;
		broadcastMatchState(matchId, {
			type: 'player:ready',
			username,
			match
		});
	}

	if (!match.running && !match.countdown && match.player1.isReady && match.player2.isReady)
		startMatch(matchId, username);
	else if (!match.player1.inRoom && !match.player2.inRoom)
		broadcastMatchState(matchId, { type: 'game:expired', username: player.username, match });
	else
		broadcastMatchState(matchId, { type: 'game:update', match });
}

function startMatch(matchId: string, username: string) {
	const match = matches.get(matchId);
	if (!match)
		return;
	match.countdown = true;
	let countdown = 3;
	const interval = setInterval(() => {
		if (countdown >= 0) {
			broadcastMatchState(matchId, {
				type: 'game:countdown',
				seconds: countdown,
				match
			});
			countdown--;
		} else {
			clearInterval(interval);
			match.running = true;
			match.countdown = false;
			const gameLoop = setInterval(() => {
				if (!match.running) {
					clearIntervals(matchId);
					const winner = match.player1.score >= 3 ? match.player1.username : match.player2.username;
					const winnerScore = match.player1.score >= 3 ? match.player1.score : match.player2.score;
					const loser = match.player1.score >= 3 ? match.player2.username : match.player1.username;
					const loserScore = match.player1.score >= 3 ? match.player2.score : match.player1.score;
					matchService.addMatch(winner, loser, winnerScore, loserScore, false);
					const sockets = matchSockets.get(matchId) || [];
					for (const socket of sockets) {
						if (socket.username === winner && socket.socket.readyState === socket.socket.OPEN) {
							socket.socket.send(JSON.stringify({
								type: 'game:winner',
								loser: loser,
								scoreLoser: loserScore,
								match
							}));
						}
						else if (socket.username !== winner && socket.socket.readyState === socket.socket.OPEN) {
							socket.socket.send(JSON.stringify({
								type: 'game:loser',
								winner: winner,
								scoreLoser: loserScore,
								match
							}));
						}
					}
					return;
				}
				moveBall(match);
				broadcastMatchState(matchId, {
					type: 'game:update',
					match
				});
			}, TICK_RATE);
			matchIntervals.set(matchId, { ...matchIntervals.get(matchId), gameLoop: gameLoop });
		}
	}, 1000);
	matchIntervals.set(matchId, { ...matchIntervals.get(matchId), countdown: interval });
}

function moveBall(match: MatchState) {
	const ball = match.ball;

	ball.pos_x += ball.velocityX;
	ball.pos_y += ball.velocityY;

	if (ball.pos_y - ball.radius < 0 || ball.pos_y + ball.radius > GAME_HEIGHT)
		ball.velocityY *= -1;

	const p1 = match.player1;
	const p2 = match.player2;

	function collide(paddle: PlayerState, side: number) {
		const impact = (ball.pos_y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
		ball.velocityY += impact * 2 + paddle.direction * 1.5;
		ball.velocityX *= -1.05;
		if (side < 0)
			ball.pos_x = paddle.x + paddle.width + ball.radius;
		else
			ball.pos_x = paddle.x - ball.radius;
	}

	if (ball.pos_x - ball.radius <= p1.x + p1.width && ball.pos_y >= p1.y && ball.pos_y <= p1.y + p1.height)
		collide(p1, -1);

	if (ball.pos_x + ball.radius >= p2.x && ball.pos_y >= p2.y && ball.pos_y <= p2.y + p2.height)
		collide(p2, 1);

	if (ball.pos_x <= 0) {
		match.player2.score++;
		resetBall(ball, 1);
	}
	if (ball.pos_x >= GAME_WIDTH) {
		match.player1.score++;
		resetBall(ball, -1);
	}
	
	if (match.player2.score >= 3)
		match.running = false;
	if (match.player1.score >= 3)
		match.running = false;
}

function resetBall(ball: BallState, direction: number) {
	ball.pos_x = GAME_WIDTH / 2;
	ball.pos_y = GAME_HEIGHT / 2;
	ball.radius = GAME_WIDTH / 80;
	ball.velocityX = 4 * direction;
	const randomY = Math.random() * 6 - 3; // entre -3 et 3
	ball.velocityY = randomY === 0 ? 2 : randomY;
}

function broadcastMatchState(matchId: string, payload: any) {
	const sockets = matchSockets.get(matchId) || [];
	for (const socket of sockets) {
		if (socket.socket.readyState === socket.socket.OPEN) {
			// console.log("2SEND TO :", socket.username);
			// console.log("2payload :", payload.type);
			socket.socket.send(JSON.stringify(payload));
		}
	}
}

function clearIntervals(matchId: string) {
	const intervals = matchIntervals.get(matchId);
	if (intervals) {
		if (intervals.countdown)
			clearInterval(intervals.countdown);
		if (intervals.gameLoop)
			clearInterval(intervals.gameLoop);
		if (intervals.countdownNotIn)
			clearInterval(intervals.countdownNotIn);
		matchIntervals.delete(matchId);
	}
}

export function handlePlayerExit(matchId: string, username: string) {
	const match = matches.get(matchId);
	if (!match)
		return;

	clearIntervals(matchId);

	let usernameToNotif: string;
	let winnerScore: number;
	let loserScore: number;
	if (match.player1.username === username) {
		usernameToNotif = match.player2.username;
		winnerScore = match.player2.score;
		loserScore = match.player1.score;
	}
	else {
		usernameToNotif = match.player1.username;
		winnerScore = match.player1.score;
		loserScore = match.player2.score;
	}

	matchService.removeInvitation(usernameToNotif, username);

	if (match.running)
		matchService.addMatch(usernameToNotif, username, winnerScore, loserScore, true);

	broadcastMatchState(matchId, {
		type: 'player:left',
		usernameExit: username,
		running: match.running,
		match
	})

	match.player1.isReady = false;
	match.player2.isReady = false;
	match.running = false;
	match.countdown = false;
	matches.delete(matchId);
}
