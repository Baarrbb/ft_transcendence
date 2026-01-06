
import { WebSocket } from 'ws';
import dbUsers from '../users/users.model.ts'
import dbFriends from '../friends/friends.model.ts'
import dbBlockUsers from '../blockUsers/blockUsers.model.ts'
import type { SocketPayloadUser, SocketPayloadChat } from '@shared/types/sockets.ts'
import type { UsersInfo } from '@shared/types/users.ts'
import HttpError from '../../utils/httpError.ts';
import dbChat from '../chat/chat.model.ts';


function constructPayloadUser(type: string, fromUser: Partial<UsersInfo>, myUsername?: string, matchId?: string): SocketPayloadUser {
	const data: SocketPayloadUser = {
		type: type,
		username: fromUser.username!,
		...(fromUser.link_avatar && { link_avatar: fromUser.link_avatar }),
		...(fromUser.elo && { elo: fromUser.elo }),
		...('online' in fromUser ? { online: fromUser.online } : {}),
		...(myUsername && { myUsername: myUsername }),
		...(matchId && { matchId: matchId })
	}
	return data;
}

export function broadcastToUser(globalUserSockets: Map<string, WebSocket[]>, 
	toUsername: string, type: string, fromUser: UsersInfo, matchId?: string)
{
	const userId = dbUsers.getUserIdByUsername(toUsername)?.user_id;
	const data: SocketPayloadUser = constructPayloadUser(type, fromUser, toUsername, matchId);
	// console.log(data);
	const sockets = globalUserSockets.get(userId) || [];
	for (const memberSocket of sockets) {
		if (memberSocket && memberSocket.readyState === memberSocket.OPEN)
			memberSocket.send(JSON.stringify(data))
	}
}

export function broadcastToFriends(globalUserSockets: Map<string, WebSocket[]>, 
	fromUserId: string, type: string, fromUser: UsersInfo)
{
	const friends = dbFriends.getFriendshipsWithRestriction(fromUserId, "")
	const data: SocketPayloadUser = constructPayloadUser(type, fromUser);
	for (const friend of friends) {
		const sockets = globalUserSockets.get(friend.user_id) || [];
		for (const memberSocket of sockets) {
			if (memberSocket && memberSocket.readyState === memberSocket.OPEN)
				memberSocket.send(JSON.stringify(data))
		}
	}
}

export function broadcastToNonFriends(globalUserSockets: Map<string, WebSocket[]>,
	fromUserId: string, type: string, fromUser: UsersInfo)
{
	const data: SocketPayloadUser = constructPayloadUser(type, fromUser);
	const friends = dbFriends.getFriendshipsWithRestriction(fromUserId, "");
	const friendIds = new Set(friends.map(f => f.user_id));

	const blockedUsers = dbBlockUsers.getBlockedUsersIdByMe(fromUserId);
	const blockedByUsers = dbBlockUsers.getBlockedMeUsersId(fromUserId);
	const blockedIds = new Set([
		...blockedUsers.map(u => u.blocked_id),
		...blockedByUsers.map(u => u.blocker_id)
	]);

	for (const [userId, socketList] of globalUserSockets.entries()) {
		if (userId === fromUserId || friendIds.has(userId) || blockedIds.has(userId))
			continue;
		for (const socket of socketList) {
			if (socket && socket.readyState === socket.OPEN)
				socket.send(JSON.stringify(data));
		}
	}
}

export function broadcastToUsers(globalUserSockets: Map<string, WebSocket[]>, type: string, fromUser: UsersInfo)
{
	const data: SocketPayloadUser = constructPayloadUser(type, fromUser);
	for (const socketList of globalUserSockets.values()) {
		for (const socket of socketList) {
			if (socket && socket.readyState === socket.OPEN)
				socket.send(JSON.stringify(data))
		}
	}
}

function setRead(userId: string, channelId: string) {
	dbChat.updateRead(channelId, userId);
}

function buildChatPayload(channelId: number, fromUsername: string, 
	type: 'chat:new_msg' | 'chat:typing' | 'chat:stopTyping' | 'chat:read', 
	options?: { 
		message?: string,
		typing?: boolean
	}
) {
	return {
		type,
		channelId,
		username: fromUsername,
		message: options?.message,
		typing: options?.typing,
		date: Date.now()
	}
}

export function broadcastOnChat(globalUserSockets: Map<string, WebSocket[]>,
	channelId: number, payload: any)
{
	const members = dbChat.getUsersIdFromChannelId(channelId);
	for (const member of members) {
		const sockets = globalUserSockets.get(member.user_id) || [];
		for (const memberSocket of sockets) {
			if (memberSocket && memberSocket.readyState === memberSocket.OPEN)
				memberSocket.send(JSON.stringify(payload))
		}
	}
}

export function isUserInChat(chatPresence: Map<string, Set<number>>, channelId: number, userId: string): boolean {
	const otherUserId = dbChat.getOtherUserIdFromChannelId(channelId, userId);
	if (!otherUserId[0]?.user_id)
		return false;
	if (chatPresence.get(otherUserId[0].user_id)?.has(channelId))
		return true;
	return false;
}

export function joinChat(chatPresence: Map<string, Set<number>>, channelId: number, userId: string) {
	if (!chatPresence.has(userId))
		chatPresence.set(userId, new Set());
	chatPresence.get(userId)!.add(channelId);
}

export function leaveChat(chatPresence: Map<string, Set<number>>, channelId: number, userId: string) {
	chatPresence.get(userId)?.delete(channelId);
	if (chatPresence.get(userId)?.size === 0)
		chatPresence.delete(userId);
}


const socketService = {
	broadcastToUser,
	broadcastToFriends,
	broadcastOnChat,
	broadcastToUsers,
	broadcastToNonFriends,
	setRead,
	joinChat,
	leaveChat,
	buildChatPayload,
	isUserInChat
};

export default socketService;