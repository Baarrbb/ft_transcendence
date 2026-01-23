
let keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
let keyUpHandler: ((e: KeyboardEvent) => void) | null = null;

export function setupListenersPaddle() {
	const state = { upPressed: false, downPressed: false };

	if (keyDownHandler)
		document.removeEventListener('keydown', keyDownHandler);
	keyDownHandler = function (e) {
		if (e.key === 'ArrowUp' || e.key === 'w')
			state.upPressed = true;
		if (e.key === 'ArrowDown' || e.key === 's')
			state.downPressed = true;
	}
	document.addEventListener('keydown', keyDownHandler);

	if (keyUpHandler)
		document.removeEventListener('keyup', keyUpHandler);
	keyUpHandler = function (e) {
		if (e.key === 'ArrowUp' || e.key === 'w')
			state.upPressed = false;
		if (e.key === 'ArrowDown' || e.key === 's')
			state.downPressed = false;
	}
	document.addEventListener('keyup', keyUpHandler);

	return state;
}

export function cleanupPaddlesListeners() {
	if (keyDownHandler)
		document.removeEventListener('keydown', keyDownHandler);
	if (keyUpHandler)
		document.removeEventListener('keyup', keyUpHandler);
	keyDownHandler = null;
	keyUpHandler = null;
}

