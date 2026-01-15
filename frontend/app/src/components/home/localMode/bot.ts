
import type { LocalGame } from '../pongLocal/localGameType.ts';

const AI_REFRESH_MS = 1000;

function moveTowards(paddle: any, targetY: number) {
	const center = paddle.pos_y + paddle.height / 2;

	if (Math.abs(targetY - center) < 8)
		return;

	if (targetY > center)
		paddle.downPressed = true;
	else
		paddle.upPressed = true;
}

function errorHuman(level: number) {
	if (level === 0)
		return (Math.random() - 0.5) * 120;
	if (level === 1)
		return (Math.random() - 0.5) * 50;
	return (Math.random() - 0.5) * 15;
}

function reactionDelay(level: number) {
	if (level === 0)
		return 10;
	if (level === 1)
		return 10;
	return 4;
}

function moveCalcul(game: LocalGame): number {
	const paddle = game.paddles.right;

	const time = Math.abs((paddle.pos_x - game.ball.pos_x) / game.ball.dir_x!);
	let predicted = game.ball.pos_y + game.ball.dir_y * time;

	const error = errorHuman(game.botDifficulty!);
	predicted += error;

	return predicted;
}

export function botUpdate(game: LocalGame) {
	if (game.ballPause)
		return;

	const paddle = game.paddles.right;
	const state = game.botState!;

	paddle.upPressed = false;
	paddle.downPressed = false;

	const now = performance.now();

	if (state.lastRefreshTime === undefined)
		state.lastRefreshTime = now;

	if (now - state.lastRefreshTime >= AI_REFRESH_MS) {
		if (game.ball.dir_x! > 0) {
			state.targetY = moveCalcul(game);
			state.reactionTimer = reactionDelay(game.botDifficulty!);
		} else
			state.targetY = null;

		state.lastRefreshTime = now;
	}

	if (state.reactionTimer > 0) {
		state.reactionTimer--;
		return;
	}

	if (state.targetY !== null)
		moveTowards(paddle, state.targetY);
}