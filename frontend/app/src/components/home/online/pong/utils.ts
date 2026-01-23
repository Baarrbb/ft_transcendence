

export function updatePlayerStatus(player: any) {
	const userStatus = document.getElementById(`${player.username}-status`);
	if (!userStatus)
		return;
	userStatus.classList.remove('text-[var(--color-primary-light)]/80', 'text-green-600', 'text-red-600');
	if (player.inRoom) {
		userStatus.classList.add('text-green-600');
		userStatus.textContent = `${player.username} in the room`;
	}
	else {
		userStatus.classList.add('text-red-600');
		userStatus.textContent = `${player.username} not in the room`;
	}
}

export function checkPlayerReady(player: any) {
	if (!player.isReady)
		return;
	const playerReady = document.getElementById(`${player.username}-ready`) as HTMLElement;
	if (playerReady) {
		playerReady.classList.remove('opacity-60');
		playerReady.classList.add('opacity-100', 'bg-[var(--color-primary-light)]/20', 'shadow-lg');
	}
}

export function updateScore(match: any) {
	const score = document.getElementById('pong-score');
	if (!score)
		return;

	const scoreP1 = document.getElementById('score-left');
	if (scoreP1) {
		const val = Number(scoreP1.textContent);
		if (val !== match.player1.score)
			scoreP1.textContent = match.player1.score
	}
	const scoreP2 = document.getElementById('score-right');
	if (scoreP2) {
		const val = Number(scoreP2.textContent);
		if (val !== match.player2.score)
			scoreP2.textContent = match.player2.score
	}
}

export function showNotification(message: string, countdown: boolean, seconds?: number): void {
	if (document.getElementById('join-party-countdown'))
		document.getElementById('join-party-countdown')?.remove();

	const notification = document.createElement('div');
	notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 transition-all duration-300 border-1 border-white bg-gradient-to-b from-black/80 via-[#0a0a1f]/90 to-black/80`;
	notification.id = 'join-party-countdown';

	const msg = document.createElement('span');
	msg.textContent = message;

	if (countdown) {
		const countdown = document.createElement('span');
		countdown.id = 'countdown';
		countdown.className = 'text-white';

		countdown.textContent = `${seconds}`;
	
		notification.appendChild(msg);
		notification.appendChild(countdown);
		document.body.appendChild(notification);
	}
	else {
		notification.appendChild(msg);
		document.body.appendChild(notification);
		setTimeout(() => {
			notification.remove();
		}, 5000);
	}
}
