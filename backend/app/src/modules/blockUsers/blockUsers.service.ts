
import type { BasicResponse, UsersListResponse } from '@shared/types/users.ts';
import dbBlockUsers from './blockUsers.model.ts'
import dbUsers from '../users/users.model.ts'
import dbFriends from '../friends/friends.model.ts';
import dbMatch from '../match/match.model.ts';
import dbChat from '../chat/chat.model.ts';

export async function blockUser(userToBlock: string, user_id: string): Promise<BasicResponse> {
	try {
		const userIdToBlock = dbUsers.getUserIdFromUsername(userToBlock);
		if (!userIdToBlock.length) {
			return {
				success: false,
				message: "Internal service error"
			}
		}

		const userToBlockId = userIdToBlock[0].user_id;
		const alreadyBlocked = dbBlockUsers.checkIfIBlockedUser(user_id, userToBlockId);
		if (alreadyBlocked.length) {
			return {
				success: false,
				message: "User already blocked"
			}
		}

		dbBlockUsers.createBlockedUser(user_id, userToBlockId);

		const friendInvite = dbFriends.existingInvitation(user_id, userToBlockId);
		if (friendInvite.length > 0)
			dbFriends.deleteInvitation(user_id, userToBlockId);

		const friend = dbFriends.getFriendship(user_id, userToBlockId);
		if (friend.length)
			dbFriends.deleteFriendship(user_id, userToBlockId);

		const matchInvite = dbMatch.existingInvitation(user_id, userToBlockId);
		if (matchInvite)
			dbMatch.deleteInvitation(user_id, userToBlockId);

		const userIsAnon = dbUsers.getIsAnonByUserId(userToBlockId);
		if (userIsAnon.is_anon === 1) {
			const res = dbChat.getChannelId(user_id, userToBlockId);
			const channelId = Number(res.id);
			dbChat.deleteAllChannel(channelId);
			dbBlockUsers.deleteBlockedUser(user_id, userToBlockId);
		}

		return {
			success: true,
			message: "User blocked"
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
	
}

export async function blockedUsers(userId: string): Promise<UsersListResponse> {
	try {
		const blockedList = dbBlockUsers.getBlockedUsers(userId);
		return {
			success: true,
			message: "Blocked users list",
			users: blockedList
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function unblockUser(userToUnblock: string, userId: string): Promise<BasicResponse> {
	try {
		const userIdToUnblock = dbUsers.getUserIdFromUsername(userToUnblock);
		if (!userIdToUnblock.length) {
			return {
				success: false,
				message: "Internal service error"
			}
		}
		const userToUnblockId = userIdToUnblock[0].user_id;

		const notBlocked = dbBlockUsers.checkIfIBlockedUser(userId, userToUnblockId);
		if (notBlocked.length === 0) {
			return {
				success: false,
				message: "User not blocked"
			}
		}

		dbBlockUsers.deleteBlockedUser(userId, userToUnblockId);

		return {
			success: true,
			message: "User unblocked successfully"
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}