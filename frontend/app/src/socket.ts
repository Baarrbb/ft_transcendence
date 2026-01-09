
type View = 'dashboard' | 'friends' | 'chat' | 'online';

let socketUser: WebSocket | null;

import { dispatchEvent } from './manager/eventDispatcher.ts';
import { getAppView, getAppSubView } from './main.ts';

export function manageSocketUser(type: 'on' |'off') {

	const host = window.location.hostname;
	const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
	const port = window.location.protocol === 'https:' ? '8000' : '3001';

	if (type === 'on') {
		if (socketUser && (socketUser.readyState === WebSocket.OPEN || socketUser.readyState === WebSocket.CONNECTING))
			return ;
		console.log(host);
		// socketUser = new WebSocket(`${protocol}://localhost:3001/ws/online`);
		socketUser = new WebSocket(`${protocol}://${host}:${port}/ws/online`);
		socketUser.onopen = () => socketUser!.send(JSON.stringify({ type: "connect" }));
		socketUser.onmessage = async (e) => {
			const data = JSON.parse(e.data);
			// listenersUser.forEach(cb => cb(data));
			// const view = localStorage.getItem('currentView');
			let view = getAppView();
			if (view === '')
				return;
			if (view === 'home') {
				const subView = getAppSubView();
				if (subView === 'online')
					view = 'online';
				// if (subView === 'tournament' && getAppSubViewMode() === 'online')
				// 	view = 'online';
			}
			console.log('je vais dispatch sur :', view, data);
			await dispatchEvent(data, view as View);
		};
		socketUser.onerror = (e) => { console.error('WebSocket user error', e); };
		socketUser.onclose = () => { socketUser = null; };
	}
	else if (socketUser) {
		socketUser.close();
		socketUser = null;
	}
}

export function getSocketUser(): WebSocket | null {
	return socketUser;
}


let socketMatch: Record<string, WebSocket> = {};
let listenersMatch: Record<string, Array<(data: any) => void>> = {};

export function manageSocketMatch(type: 'on' |'off', matchId: string, onOpen?: () => void) {
	const host = window.location.hostname;
	const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
	const port = window.location.protocol === 'https:' ? '8000' : '3001';
	if (type === 'on') {
		if (socketMatch[matchId] && 
			(socketMatch[matchId].readyState === WebSocket.OPEN || socketMatch[matchId].readyState === WebSocket.CONNECTING))
			return;
		socketMatch[matchId] = new WebSocket(`${protocol}://${host}:${port}/ws/match/${matchId}`);
		socketMatch[matchId].onopen = () => {
			if (onOpen)
				onOpen();
		};
		socketMatch[matchId].onmessage = (e) => {
			const data = JSON.parse(e.data);
			listenersMatch[matchId].forEach(cb => cb(data));
		};
		socketMatch[matchId].onerror = (e) => { console.error('WebSocket Match error', e); };
		socketMatch[matchId].onclose = () => { delete socketMatch[matchId]; };
	}
	else if (socketMatch[matchId]) {
		socketMatch[matchId].close();
		// socketMatch[matchId] = null;
		delete socketMatch[matchId];
		delete listenersMatch[matchId];
	}
}

export function getSocketMatch(matchId: string): WebSocket {
	return socketMatch[matchId];
}

export function addSocketMatchListener(matchId: string, cb: (data: any) => void) {
	if (!listenersMatch[matchId])
		listenersMatch[matchId] = [];
	listenersMatch[matchId].push(cb);
}

export function removeSocketMatchListener(matchId: string, cb: (data: any) => void) {
	if (!listenersMatch[matchId])
		return;
	listenersMatch[matchId] = listenersMatch[matchId].filter(fn => fn !== cb);
}
