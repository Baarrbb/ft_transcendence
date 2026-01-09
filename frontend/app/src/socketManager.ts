
import { removeSocketMatchListener, addSocketMatchListener } from './socket.ts';

type SocketHandler = (data: any) => void;
const activeHandlers: SocketHandler[] = [];

export function setActiveMatchHandlers(matchId: string, handlers: SocketHandler[]) {
	for (const h of activeHandlers)
		removeSocketMatchListener(matchId, h);
	activeHandlers.length = 0;

	for (const h of handlers) {
		addSocketMatchListener(matchId, h);
		activeHandlers.push(h);
	}
}

export function clearMatchHandlers(matchId: string) {
	for (const h of activeHandlers)
		removeSocketMatchListener(matchId, h);
	activeHandlers.length = 0;
}

