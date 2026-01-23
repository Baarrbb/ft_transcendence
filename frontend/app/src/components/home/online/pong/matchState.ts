

let currentMatchId: string | null = null;

export function setCurrentMatchId(id: string | null) {
	currentMatchId = id;
}

export function getCurrentMatchId(): string | null {
	return currentMatchId;
}

let pongInterval: number | undefined = undefined;

export function setPongInterval(interval: number | undefined) {
	pongInterval = interval;
}

export function getPongInterval(): number | undefined {
	return pongInterval;
}
