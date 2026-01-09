
import { blockedHandlers } from './blockedHandlers.ts';
import { unblockedHandlers } from './unblockedHandlers.ts';
import { onlineHandlers, offlineHandlers, onlineUserHandlers } from './onlineHandlers.ts';
import { acceptedFriendHandlers } from './friendAcceptedHandlers.ts';
import { removedFriendHandlers } from './friendRemovedHandlers.ts';
import { newFriendRequestHandlers, declinedFriendHandlers } from './friendRequestHandlers.ts';
import { newMsgHandlers, typingHandlers, readHandlers } from './onChatHandlers.ts';
import { handleGameInvitationAccepted, handleInGame, handleGameNewInvitation, handleRemoveInvitation, inviteNewHandlers, inviteRemovedHandlers, inviteAcceptedHandlers, gameIndHandlers, gameOutdHandlers } from './inviteHandlers.ts';
import { anonymizeHandlers } from './anonymizeHandler.ts';
import { deletedHandlers } from './deletedHandlers.ts';

type View = 'dashboard' | 'friends' | 'chat' | 'online';

type EventType = 'blocked' | 'unblocked' |
	'online' | 'offline' | 'onlineUser' |
	'friend:request:accepted' | 'friend:removed' |
	'friend:request:new' | 'friend:request:declined' |
	'chat:new_msg' | 'chat:typing' | 'chat:stopTyping' | 'chat:read' |
	'game:invite:new' | 'game:invite:removed' |
	'game:accepted' | 'game:in' | 'game:out' 
	| 'anonymize' | 'deleted';

type Handler = (data: any) => Promise<void> | void;

const eventHandlers: Record< EventType, Partial< Record< View, Handler > > > = {
	'blocked': blockedHandlers,
	'unblocked': unblockedHandlers,
	'online': onlineHandlers,
	'offline': offlineHandlers,
	'onlineUser': onlineUserHandlers,
	'friend:request:accepted': acceptedFriendHandlers,
	'friend:removed': removedFriendHandlers,
	'friend:request:new': newFriendRequestHandlers,
	'friend:request:declined': declinedFriendHandlers,
	'chat:new_msg': newMsgHandlers,
	'chat:typing': typingHandlers,
	'chat:stopTyping': typingHandlers,
	'chat:read': readHandlers,
	'game:invite:new': inviteNewHandlers,
	'game:invite:removed': inviteRemovedHandlers,
	'game:accepted': inviteAcceptedHandlers,
	'game:in': gameIndHandlers,
	'game:out': gameOutdHandlers,
	'anonymize': anonymizeHandlers,
	'deleted': deletedHandlers
}

const globalHandlers: Partial< Record< EventType, Handler > > = {
	'game:invite:new': handleGameNewInvitation,
	'game:invite:removed': handleRemoveInvitation,
	'game:in': handleInGame,
	'game:accepted': handleGameInvitationAccepted
}

export async function dispatchEvent(data: any, view: View) {
	const type = data.type as EventType;
	// console.log(type);

	const globalHandler = globalHandlers[type];
	// console.log("global", globalHandler);
	if (globalHandler)
		await globalHandler(data);

	const viewHandler = eventHandlers[type]?.[view];
	// console.log("view", viewHandler);
	if (viewHandler)
		await viewHandler(data);
}
