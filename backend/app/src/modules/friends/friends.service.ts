
import type { BasicResponse, UsersListResponse } from '@shared/types/users.ts';
import dbUsers from '../users/users.model.ts';
import dbBlockUsers from '../blockUsers/blockUsers.model.ts';
import dbFriends from './friends.model.ts';
import chatService from '../chat/chat.service.ts'
import dbChat from '../chat/chat.model.ts'


function returnFalse(msg: string) {
	return {
		success: false,
		message: msg
	}
}

export async function addFriend(username: string, user_id: string): Promise<BasicResponse> {
	
	try {
		if (!username)
			return returnFalse("Unexpected error. Try again");
		const users = dbUsers.getUsersByUsername(username);
		if (users.length === 0 || users[0].user_id === user_id)
			return returnFalse("Unexpected error. Try again");

		const blockedUser = dbBlockUsers.checkIfBlockedId(user_id, users[0].user_id);
		// console.log(blockedUser);
		if (blockedUser.length > 0)
			return returnFalse("You cannot invite a blocked user.");

		const existingInvite = dbFriends.existingInvitation(user_id, users[0].user_id);
		if (existingInvite.length > 0)
			return returnFalse("Invitation already pending");

		const existingFriend = dbFriends.getFriendship(user_id, users[0].user_id);
		if (existingFriend.length > 0)
			return returnFalse("You're already friends");

		dbFriends.createInvitation(user_id, users[0].user_id);

		return {
			success: true,
			message: "Invitation sent"
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function acceptFriend(fromUsername: string, user_id: string): Promise<BasicResponse> {
	try {
		if (!fromUsername)
			return returnFalse("Unexpected error. Try again");
		const user = dbUsers.getUserByUsername(fromUsername);
		if (!user)
			return returnFalse("Unexpected error. Try again");

		const findInvite = dbFriends.findInvitation(user_id, user.user_id);
		if (!findInvite)
			return returnFalse("Unexpected error. Try again");

		dbFriends.deleteInvitationFromId(findInvite.id);
		dbFriends.createFriendship(user_id, user.user_id);

		chatService.createPrivateChannel(user_id, user.user_id);

		return {
			success: true,
			message: "Invitation accepted"
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function declineFriend(fromUsername: string, user_id: string): Promise<BasicResponse> {

	try {
		if (!fromUsername)
			return returnFalse("Unexpected error. Try again");
		const user = dbUsers.getUserByUsername(fromUsername);
		if (!user)
			return returnFalse("Unexpected error. Try again");

		const findInvite = dbFriends.findInvitation(user_id, user.user_id);
		if (!findInvite)
			return returnFalse("Unexpected error. Try again");

		dbFriends.deleteInvitationFromId(findInvite.id);

		return {
			success: true,
			message: "Invitation declined"
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function getFriendsList(sort: string, limit: string, user_id: string): Promise<UsersListResponse> {
	try {
		let restrict: string = '';
		if (sort === 'elo')
			restrict += ' ORDER BY elo DESC, username ASC';
		if (sort === 'username')
			restrict += ' ORDER BY username ASC';
		if (sort === 'creation')
			restrict += ' ORDER BY f.created_at DESC';
		if (sort === 'message')
			restrict = ' ORDER BY last_event DESC NULLS LAST';
		if (limit) {
			const parsedLimit = parseInt(limit, 10);
			if (isNaN(parsedLimit)) {
				return {
					success: false,
					message: "Error parsing limit users"
				};
			}
			restrict += ` LIMIT ${limit}`
		}

		const friends = dbFriends.getFriendshipsWithRestriction(user_id, restrict, sort);
		const friendsWoCreatedAt = friends.map(({ user_id, created_at, ...rest }) => rest);

		return {
			success: true,
			message: "Friends list",
			users: friendsWoCreatedAt
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function removeFriend(username: string, user_id: string): Promise<BasicResponse> {
	try {
		if (!username)
			return returnFalse("Unexpected error. Try again");
		const user = dbUsers.getUserByUsername(username);
		if (!user)
			return returnFalse("Unexpected error. Try again");

		const findFriendship = dbFriends.getFriendship(user_id, user.user_id);
		if (findFriendship.length === 0)
			return returnFalse("Unexpected error. Try again");

		dbFriends.deleteFriendshipFromId(findFriendship[0].id);

		const userIsAnon = dbUsers.getIsAnonByUserId(user.user_id);
		if (userIsAnon.is_anon === 1) {
			const res = dbChat.getChannelId(user_id, user.user_id);
			const channelId = Number(res.id);
			dbChat.deleteAllChannel(channelId);
		}

		return {
			success: true,
			message: "Remove friendship",
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function getOnlineFriends(user_id: string): Promise<UsersListResponse> {
	try {
		const onlineFriends = dbFriends.getOnlineFriends(user_id);
		return {
			success: true,
			message: "connected friends",
			users: onlineFriends
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

const friendService = {
	addFriend,
	acceptFriend,
	declineFriend,
	getFriendsList,
	removeFriend,
	getOnlineFriends
};

export default friendService;
