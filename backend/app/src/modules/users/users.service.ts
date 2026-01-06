
import type { UserResponse, UsersListResponse, UserErrors, BasicResponse } from '@shared/types/users.ts';
import type { PublicUser } from './users.model.ts'
import { UsernameSchema, EmailSchema, PasswordSchema } from './users.schema.ts'
import dbUsers, { getUserByUserId } from './users.model.ts'
import dbFriends from '../friends/friends.model.ts'
import dbAuth from '../auth/auth.model.ts'
import dbBlockUsers from '../blockUsers/blockUsers.model.ts'
import dbMatch from '../match/match.model.ts'
import dbChat from '../chat/chat.model.ts'
import type { MultipartFile } from '@fastify/multipart';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { fileTypeFromFile } from 'file-type';
import bcrypt from 'bcrypt';

function createErrorUsername(msg: string): UserResponse {
	return {
		success: false,
		message: "Username not changed",
		errors: { username: msg }
	}
}

export async function updateUsername(newUsername: string, userId: string): Promise<UserResponse> {

	// console.log(newUsername);
	try {
		const checkUsername = UsernameSchema.safeParse({ username: newUsername });
		if (!checkUsername.success)
			return createErrorUsername(checkUsername.error.issues[0].message);

		const existingUsername = dbUsers.getUsersByUsername(newUsername);
		if (existingUsername.length > 0)
			return createErrorUsername("Username already taken");

		dbUsers.updateUsername(newUsername, userId);

		return {
			success: true,
			message: "Username updated successfully",
		};
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function updateAvatar(dataFile: MultipartFile, user: PublicUser): Promise<UserResponse> {
	try {
		const ext = path.extname(dataFile.filename).toLowerCase();
		const filename = `avatar_${user.id}_${Date.now()}${ext}`

		const filePath = path.join('/app/uploads', filename);
		if (!fs.existsSync('/app/uploads'))
			throw new Error("Internal Server Error: Upload failed");

		await pipeline(dataFile.file, fs.createWriteStream(filePath));

		const type = await fileTypeFromFile(filePath);
		if (!type || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type.ext)) {
			const fmt = type ? type.ext : type;
			fs.unlinkSync(filePath);
			return {
				success: false,
				message: "Avatar not updated",
				errors: { avatar: `Type file : ${fmt}. Supported file : gif, png, jpg, jpeg` }
			}
		}

		if (user.link_avatar && user.link_avatar !== 'avatar.jpg') {
			const oldPath  = path.join('/app/uploads', user.link_avatar);
			if (fs.existsSync(oldPath))
				fs.unlinkSync(oldPath);
		}

		dbUsers.updateAvatar(filename, user.user_id);

		return {
			success: true,
			message: "Avatar updated successfully",
			user: {
				avatar: filename,
			}
		};
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

function createErrorEmail(msg: string): UserResponse {
	return {
		success: false,
		message: "Email not changed",
		errors: { email: msg }
	}
}

export async function updateEmail(newEmail: string, userId: string): Promise<UserResponse> {

	// console.log(newEmail);
	try {
		const checkEmail = EmailSchema.safeParse({ email: newEmail });
		if (!checkEmail.success)
			return createErrorEmail(checkEmail.error.issues[0].message);

		const existingEmail = dbUsers.getUsersByEmail(newEmail);
		if (existingEmail.length > 0)
			return createErrorEmail("Email already taken");

		dbUsers.updateEmail(newEmail, userId);

		return {
			success: true,
			message: "Email updated successfully",
		};
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function updatePassword(actualPassword: string, newPassword: string, user_id: string): Promise<UserResponse> {

	try {
		const allErrors: UserErrors = {};
		const checkPassword = PasswordSchema.safeParse({ newPassword });
		if (!checkPassword.success)
			allErrors.newPassword = checkPassword.error.issues[0].message;

		const existingUser = dbUsers.getUserByUserId(user_id);
		const isPasswordValid = await bcrypt.compare(actualPassword, existingUser.password);
		if (!isPasswordValid)
			allErrors.password = "Your current password doesnt match";

		if (actualPassword === newPassword)
			allErrors.newPassword = "New password cannot be the same as old password";

		if (Object.keys(allErrors).length > 0) {
			return {
				success: false,
				message: "Update fail",
				errors: allErrors,
			}
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		dbUsers.updatePassword(hashedPassword, user_id);

		return {
			success: true,
			message: "Password updated successfully"
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}

}

export async function addPassword(newPassword: string, userId: string): Promise<UserResponse> {
	try {
		const allErrors: UserErrors = {};
		const checkPassword = PasswordSchema.safeParse({ newPassword });
		if (!checkPassword.success)
			allErrors.newPassword = checkPassword.error.issues[0].message;

		if (Object.keys(allErrors).length > 0) {
			return {
				success: false,
				message: 'Failed to create password.',
				errors: allErrors,
			}
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		dbUsers.updatePassword(hashedPassword, userId);

		return {
			success: true,
			message: "Password created"
		}
	}
	catch (error) {
		// console.log(error);
		throw error;
	}
}


function getUsersWithRestriction(sort: string, limit: string) {
	let restrict: string = '';

	if (sort === 'elo')
		restrict += ' ORDER BY elo DESC, username ASC'
	if (sort === 'username')
		restrict += ' ORDER BY username ASC'
	if (limit) {
		const parsedLimit = parseInt(limit, 10);
		if (!isNaN(parsedLimit))
			restrict += ` LIMIT ${limit}`
	}
	const users = dbUsers.getUsersWithRestriction(restrict);
	return users;
}

export async function getLeaderboardUsers(sort: string, limit: string, myUserId: string): Promise<UsersListResponse> {
	try {
		const users = getUsersWithRestriction(sort, limit);
		const usersWithMe = users.map(user => ({
			...user,
			me: user.user_id === myUserId
		}))

		return {
			success: true,
			message: "Top users",
			users: usersWithMe
		};
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function getUsersNonFriend(myUserId: string): Promise<UsersListResponse> {
	try {
		const nonFriends = dbUsers.getNonFriends(myUserId);

		return {
			success: true,
			message: "Friendships listing",
			users: nonFriends
		};

	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function getOnlineUsers(user_id: string): Promise<UsersListResponse> {
	try {
		const onlineUsers = dbUsers.getOnlineNonFriends(user_id);
		return {
			success: true,
			message: "connected users",
			users: onlineUsers
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export function getInvitations(user_id: string) {
	try {
		const sentInvitations = dbFriends.getSentInvitations(user_id);
		const receivedInvitations = dbFriends.getReceivedInvitations(user_id)

		const allUsernames = new Set([
			...sentInvitations.map(u => u.username),
			...receivedInvitations.map(u => u.username),
		]);

		const statusList = [];
		for (const username of allUsernames) {
			const sent = sentInvitations.find(u => u.username === username);
			const received = receivedInvitations.find(u => u.username === username);
			if (sent)
				statusList.push({ username, status: 'sent' });
			else if (received)
				statusList.push({ username, status: 'received' });
		}

		return {
			success: true,
			message: "Invitations status",
			users: statusList
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}


export async function anonymizeData(user_id: string, sessionToken: string): Promise<BasicResponse> {
	try {
		const user = getUserByUserId(user_id);
		if (user.link_avatar && user.link_avatar !== 'avatar.jpg') {
			const oldPath  = path.join('/app/uploads', user.link_avatar);
			if (fs.existsSync(oldPath))
				fs.unlinkSync(oldPath);
		}

		dbUsers.anonymizeDataUser(user_id);
		dbAuth.deleteDataAuth(user_id, sessionToken); // auth // session autre que actuelle si il y en a pcq actuelle supp au logout
		dbAuth.deleteJWTByUserId(user_id); // jwt
		dbFriends.deleteDataInvite(user_id); // invitation
		dbBlockUsers.deleteDataBlockedUsers(user_id);
		dbMatch.deleteDataMatchInvitation(user_id); // que match_invite

		return {
			success: true,
			message: 'Anonymize'
		}
	}
	catch (error) {
		throw error;
	}
}

export async function deleteData(user_id: string, sessionToken: string): Promise<BasicResponse> {
	try {
		const user = getUserByUserId(user_id);
		if (user.link_avatar && user.link_avatar !== 'avatar.jpg') {
			const oldPath  = path.join('/app/uploads', user.link_avatar);
			if (fs.existsSync(oldPath))
				fs.unlinkSync(oldPath);
		}

		dbAuth.deleteDataAuth(user_id, sessionToken); // auth // session autre que actuelle
		dbAuth.deleteSessionBySessionToken(sessionToken);
		dbAuth.deleteJWTByUserId(user_id); // jwt
		dbFriends.deleteDataFriendsAndInvite(user_id); // friendships et invitation
		dbBlockUsers.deleteDataBlockedUsers(user_id);
		dbMatch.deleteDataMatchInvitation(user_id); // match_invite

		const privateConv = dbChat.getAllChannelId(user_id);
		for (const id of privateConv)
			dbChat.deleteAllChannel(Number(id.channel_id));

		dbChat.deleteFromGroup(user_id);

		dbUsers.deleteDataUser(user_id);

		return {
			success: true,
			message: 'Delete'
		}
	}
	catch (error) {
		throw error;
	}
}

export async function requestData(userId: string) {
	try {
		const user = dbUsers.getUserByUserId(userId);
		const friendships = dbFriends.getFriendsUsername(userId);
		const blockedUser = dbBlockUsers.getBlockedUsers(userId);
		const matches = dbMatch.getHistoryWOUsername(userId);
		const msg = dbChat.getMyMessages(userId);
		return {
			user: {
				username: user.username,
				email: user.email,
				elo: user.elo,
				created_at: user.created_at
			},
			friends: friendships,
			blocked_users: blockedUser,
			matches: matches,
			messages: msg
		}
	}
	catch (error) {
		throw error;
	}
}


const usersService = {
	updateUsername,
	updateAvatar,
	updateEmail,
	updatePassword,
	addPassword,
	getLeaderboardUsers,
	// getFriendshipsListing,
	getUsersNonFriend,
	getOnlineUsers,
	getInvitations,
	anonymizeData,
	deleteData,
	requestData
};

export default usersService;

