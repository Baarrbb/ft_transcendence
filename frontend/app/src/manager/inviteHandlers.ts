import { getCurrentMatchId } from '../components/home/online/pong/matchState.ts';
import { renderInvitationOverlay } from '../components/home/online/pong/render.ts';
import { inviteStore } from '../store/inviteStore.ts';
import { manageSocketMatch, getSocketMatch } from '../socket.ts';
import { initMatchHandlers } from '../components/home/online/pong/handlers.ts';
import { renderInvitationAcceptedOverlay } from '../components/home/online/pong/render.ts';

export function handleGameNewInvitation(data: any) {
	if (!getCurrentMatchId())
		renderInvitationOverlay(data.username);
}

export function handleRemoveInvitation() {
	const overlayDiv = document.getElementById('invitation-overlay');
	if (overlayDiv)
		overlayDiv.remove();
}

export function handleInGame() {
	const overlay = document.getElementById('invitation-overlay');
	if (overlay)
		overlay.remove();
}

export function handleGameInvitationAccepted(data: any) {
	manageSocketMatch('on', data.matchId, () => {
		console.log("ouverture socket player:out:", data.matchId)
		const socketMatch = getSocketMatch(data.matchId);
		socketMatch?.send(JSON.stringify({
			type: "player:out",
		}));
		initMatchHandlers(data.matchId, false);
	});
	if (!getCurrentMatchId())
		renderInvitationAcceptedOverlay(data.username);
}


function handleGameNewInvitationInView(data: any) {
	inviteStore.updateInvite(data.username, 'received', 'none');
}

export const inviteNewHandlers = {
	chat: handleGameNewInvitationInView,
	online: handleGameNewInvitationInView,
	friends: handleGameNewInvitationInView,
};

function handleRemoveInvitationInView(data: any) {
	inviteStore.updateInvite(data.username, 'none', 'received');
	inviteStore.updateInvite(data.username, 'none', 'sent');
}

export const inviteRemovedHandlers = {
	chat: handleRemoveInvitationInView,
	online: handleRemoveInvitationInView,
	friends: handleRemoveInvitationInView,
};

function handleGameInvitationAcceptedInView(data: any) {
	inviteStore.updateInvite(data.username, 'accepted', 'sent', data.matchId);
}

export const inviteAcceptedHandlers = {
	chat: handleGameInvitationAcceptedInView,
	online: handleGameInvitationAcceptedInView,
	friends: handleGameInvitationAcceptedInView,
};

function handleInGameInView(data: any) {
	inviteStore.updateInvite(data.username, 'occupied', 'received');
}

export const gameIndHandlers = {
	chat: handleInGameInView,
	online: handleInGameInView,
	friends: handleInGameInView,
};

function handleOutGame(data: any) {
	inviteStore.updateInvite(data.username, 'received', 'occupied');
}

export const gameOutdHandlers = {
	chat: handleOutGame,
	online: handleOutGame,
	friends: handleOutGame,
};
