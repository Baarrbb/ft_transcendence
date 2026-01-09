
import { friendsStore } from '../store/friendsStore.ts';


function handleReceivedFriendRequest(data: any) {
	friendsStore.updateInvite(data.username, 'received', 'none');
}

export const newFriendRequestHandlers = {
	friends: handleReceivedFriendRequest,
};

function handleDeclinedFriend(data: any) {
	friendsStore.updateInvite(data.username, 'none', 'sent');
}

export const declinedFriendHandlers = {
	friends: handleDeclinedFriend
};

