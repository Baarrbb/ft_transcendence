
import { FastifyRequest, FastifyReply } from 'fastify'
import { WebSocket } from 'ws';
import type { UsersInfo } from '@shared/types/users.ts'
import sessionUtils from '../../utils/sessionHandling.ts'
import HttpError from '../../utils/httpError.ts'
import socketService, { broadcastToUser, isUserInChat } from './sockets.service.ts'
import dbUsers from '../users/users.model.ts';
import { createMatch, setPlayerInRoom, matchSockets, playerMove, handlePlayerExit } from '../match/matchStore.ts'
import { startCountdown } from '../match/matchStore.ts'
import dbChat from '../chat/chat.model.ts';

const globalUserSockets: Map<string, WebSocket[]> = new Map();
// const userStates: Map<string, { inGame: boolean }> = new Map();

const chatPresence: Map<string, Set<number>> = new Map();

export class SocketController {

	userSocketHandler = async (socket: WebSocket, request: FastifyRequest) => {
		try {
			const user = request.localUser;
			if (!globalUserSockets.has(user.user_id))
				globalUserSockets.set(user.user_id, []);
			globalUserSockets.get(user.user_id)!.push(socket);

			socket.on('message', async (data) => {
				try {
					const dataToString = data.toString();
					const received = JSON.parse(dataToString);

					switch (received.type) {
						case 'connect':
							dbUsers.updateUserStatus(user.username, 1);
							const userStatus = dbUsers.getOnlineByUserId(user.user_id)?.online;
							if (userStatus === 1) {
								socketService.broadcastToFriends(globalUserSockets, user.user_id, 'online', buildFromUser(user, true, true));
								socketService.broadcastToNonFriends(globalUserSockets, user.user_id, 'onlineUser', buildFromUser(user, true, true));
							}
							break;
						case 'delete':
							socketService.broadcastToUsers(globalUserSockets, 'offline', buildFromUser(user));
							socketService.broadcastToFriends(globalUserSockets, user.user_id, 'deleted', buildFromUser(user));
							socketService.broadcastToNonFriends(globalUserSockets, user.user_id, 'deleted', buildFromUser(user));
							break;
						case 'friend:request':
							socketService.broadcastToUser(globalUserSockets, received.username, "friend:request:new", buildFromUser(user));
							break;
						case 'friend:request:accept':
							socketService.broadcastToUser(globalUserSockets, received.username, "friend:request:accepted", buildFromUser(user, false, false, true));
							const userData = dbUsers.getUserByUsername(received.username);
							if (!userData)
								break;
							socketService.broadcastToUser(globalUserSockets, user.username, "friend:request:accepted", buildFromUser(userData, false, false, true));
							break;
						case 'friend:request:decline':
							socketService.broadcastToUser(globalUserSockets, received.username, "friend:request:declined", buildFromUser(user));
							break;
						case 'friend:remove':
							socketService.broadcastToUser(globalUserSockets, received.username, "friend:removed", buildFromUser(user));
							const usernameR = received.username;
							socketService.broadcastToUser(globalUserSockets, user.username, "friend:removed", buildFromUser({ username: usernameR }));
							break;
						case 'block':
							socketService.broadcastToUser(globalUserSockets, received.username, "blocked", buildFromUser(user));
							break
						case 'unblock':
							socketService.broadcastToUser(globalUserSockets, received.username, "unblocked", buildFromUser(user, true, true, true));
							break;
						case 'game:invite':
							socketService.broadcastToUser(globalUserSockets, received.username, "game:invite:new", buildFromUser(user, true, true));
							break;
						case 'game:invite:remove':
							socketService.broadcastToUser(globalUserSockets, received.username, "game:invite:removed", buildFromUser(user));
							const username = received.username;
							socketService.broadcastToUser(globalUserSockets, user.username, "game:invite:removed", buildFromUser({ username }));
							break;
						case 'game:accept':
							dbUsers.updateInGame(user.user_id, true);
							createMatch(received.matchId, received.username, user.username);
							socketService.broadcastToUser(globalUserSockets, received.username, "game:accepted", buildFromUser(user), received.matchId);
							break;
						case 'anonymize':
							socketService.broadcastToFriends(globalUserSockets, user.user_id, 'anonymize', buildFromUser(user));
							socketService.broadcastToNonFriends(globalUserSockets, user.user_id, 'anonymize', buildFromUser(user));
							socketService.broadcastToUsers(globalUserSockets, 'offline', buildFromUser(user));
							break;
						case 'chat:send': {
							const channelId = received.channelId;
							const message = received.message;
							if (!channelId || !message)
								return;
							const channel = dbChat.getChannelFromId(channelId);
							dbChat.addMessage(user.user_id, message, channelId, null, channel.channel_name);
							const payload = socketService.buildChatPayload(channelId, user.username, 'chat:new_msg', { message });
							socketService.broadcastOnChat(globalUserSockets, channelId, payload);
							break;
						}
						case 'typing:start': {
							const channelId = received.channelId;
							if (!channelId)
								return;
							if (isUserInChat(chatPresence, channelId, user.user_id)) {
								const payloadTyping = socketService.buildChatPayload(channelId, user.username, 'chat:typing', { typing: true });
								socketService.broadcastOnChat(globalUserSockets, channelId, payloadTyping);
							}
							break;
						}
						case 'typing:stop': {
							const channelId = received.channelId;
							if (!channelId)
								return;
							if (isUserInChat(chatPresence, channelId, user.user_id)) {
								const payloadTyping = socketService.buildChatPayload(channelId, user.username, 'chat:stopTyping', { typing: false });
								socketService.broadcastOnChat(globalUserSockets, channelId, payloadTyping);
							}
							break;
						}
						case 'chat:join': {
							const channelId = received.channelId;
							if (!channelId)
								return;
							socketService.joinChat(chatPresence, channelId, user.user_id);
							socketService.setRead(user.user_id, channelId);
							const payloadJoin = socketService.buildChatPayload(channelId, user.username, 'chat:read');
							socketService.broadcastOnChat(globalUserSockets, channelId, payloadJoin);
							break;
						}
						case 'chat:leave': {
							const channelId = received.channelId;
							if (!channelId) {
								chatPresence.delete(user.user_id);
								return;
							}
							socketService.leaveChat(chatPresence, channelId, user.user_id);
							break;
						}
						case 'chat:read': {
							const channelId = received.channelId;
							if (!channelId) 
								return;
							socketService.setRead(user.user_id, channelId);
							const payload = socketService.buildChatPayload(channelId, user.username, 'chat:read');
							socketService.broadcastOnChat(globalUserSockets, channelId, payload);
							break;
						}
					}
				}
				catch (error) {
					console.error("Internal server error");
				}
			})

			socket.on('close', () => {
				try {
					dbUsers.updateUserStatus(user.username, -1);
					const userStatus = dbUsers.getOnlineByUserId(user.user_id)?.online;
					if (userStatus === 0)
						socketService.broadcastToUsers(globalUserSockets, 'offline', buildFromUser(user));
						// socketService.broadcastToFriends(globalUserSockets, user.user_id, 'offline', buildFromUser(user));

					chatPresence.delete(user.user_id);

					const sessionToken = request.cookies.sessionToken;
					if (!sessionToken) {
						console.error("Unauthorized, authentification required");
						return ;
					}
					sessionUtils.updateLastActivity(sessionToken);
					const sockets = globalUserSockets.get(user.user_id);
					if (sockets) {
						const i = sockets.indexOf(socket);
						if (i !== -1)
							sockets.splice(i, 1);
						if (sockets.length === 0)
							globalUserSockets.delete(user.user_id);
					}
				}
				catch (error) {
					console.error("Internal server error");
				}
			});

		}
		catch (error) {
			if (error instanceof HttpError)
				throw error;
			throw new HttpError(500, "Internal server error");
		}
	}

	gameSocketHandler = async (socket: WebSocket, request: FastifyRequest, matchId: string) => {
		try {
			const user = request.localUser;

			if (!matchSockets.has(matchId))
				matchSockets.set(matchId, []);
			const sockets = matchSockets.get(matchId) || [];
			sockets.push({ socket: socket, username: user.username })
			matchSockets.set(matchId, sockets);
			// matchSockets.get(matchId)!.push(socket);

			socket.on('message', async (data) => {
				const dataToString = data.toString();
				const received = JSON.parse(dataToString);
				switch (received.type) {
					case 'player:in':
						// userStates.set(user.user_id, { inGame: true });
						dbUsers.updateInGame(user.user_id, true);
						socketService.broadcastToUsers(globalUserSockets, "game:in", buildFromUser(user));
						setPlayerInRoom(matchId, user.username);
						break;
					case 'player:move':
						playerMove(matchId, user.username, received.direction)
						break;
					case 'player:exit':
						// userStates.set(user.user_id, { inGame: false });
						dbUsers.updateInGame(user.user_id, false);
						socketService.broadcastToUsers(globalUserSockets, "game:out", buildFromUser(user));
						handlePlayerExit(matchId, user.username);
						break;
					case 'player:out':
						startCountdown(matchId, user.username);
						break;
				}
			})
		}
		catch (error) {
			console.error("Internal server error");
		}
	}

}

function buildFromUser(user: any, withAvatar = false, withElo = false, online = false): UsersInfo {
	let currentOnline = false;
	if (online && user.user_id) {
		const userStatus = dbUsers.getOnlineByUserId(user.user_id);
		currentOnline = userStatus?.online > 0 ? true : false;
	}

	return {
		username: user.username,
		...(withAvatar && { link_avatar: user.link_avatar }),
		...(withElo && { elo: user.elo }),
		...(online && { online: currentOnline })
	};
	// ...(online && { online: user.online })
}



export const socketController = new SocketController();