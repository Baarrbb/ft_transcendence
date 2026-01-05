
import dbUsers from '../users/users.model.ts';
import type { ChannelInfo, ChatHistory, MessageData } from '@shared/types/chat.ts';
import dbChat from './chat.model.ts'
import dbMatch from '../match/match.model.ts';

export function getChannelInfo(myUserId: string, username: string): ChannelInfo {
	try {
		const user2Id = dbUsers.getUserByUsername(username)?.user_id;
		const [u1, u2] = [myUserId, user2Id].sort((a, b) => a.localeCompare(b));
		const channel_name = `chan_${u1}_${u2}`;
		const channelId = dbChat.getChannelInfoByChannelName(channel_name)?.id;
		return {
			success: true,
			message: "Channel info",
			channel_id: channelId,
			channel_name: channel_name
		}
	}
	catch (error) {
		// console.log(error);
		throw error;
	}
}

export function getChatHistory(myUserId: string, channelId: string): ChatHistory {
	try {
		const messages = dbChat.getChatHistoryByChannelId(channelId);
		const users_id = dbChat.getUsersIdFromChannelId(Number(channelId));
		if (!users_id) {
			return {
				success: false,
				message: 'Fail to retrieve users'
			}
		}
		const other_user = users_id.find(user => user.user_id !== myUserId);
		const other_id = other_user?.user_id;
		const user = dbUsers.getUserByUserId(other_id);
		if (!user) {
			return {
				success: false,
				message: 'Fail retrieve user'
			}
		}
		const invitation = dbMatch.existingInvitation(myUserId, other_id);
		let invite = 'none';
		let matchId: any;
		if (invitation) {
			if (invitation.from_user === myUserId && invitation.status === 'accepted') {
				invite = 'accepted';
				matchId = dbMatch.getMatchId(myUserId, other_id);
			}
			else if (invitation.from_user === myUserId)
				invite = 'sent';
			else
				invite = user.in_game ? 'occupied' : 'received';
		}
		// console.log("MATCHID :::::::::::::::", matchId);
		// console.log("MATCHID :::::::::::::::", matchId.match_id);
		// console.log("MATCHID :::::::::::::::", typeof matchId.match_id);

		const dataNeeded = messages.map((msg: any) => ({
			from: msg.username,
			msg: msg.msg,
			read: msg.is_read,
			date: msg.created_at,
			type: 'message'
		}));

		if (invitation) {
			const myUsername = dbUsers.getUsernameByUserId(myUserId);
			const other = dbUsers.getUsernameByUserId(other_id);
			const invitationMessage = {
				from: invitation.from_user === myUserId ? myUsername.username : other.username,
				msg: '',
				date: invitation.created_at,
				type: 'invitation',
				typeInvite: invite,
				matchId: invite === 'accepted' ? matchId.match_id : undefined
			};
			dataNeeded.push(invitationMessage);
		}

		dataNeeded.sort((a: MessageData, b: MessageData) => new Date(a.date).getTime() - new Date(b.date).getTime())

		// console.log(dataNeeded);
		return ({
			success: true,
			message: "History",
			messages: dataNeeded
		})
	}
	catch (error) {
		// console.log(error);
		throw error;
	}
}

export function createPrivateChannel(myUserId: string, user2Id: string) {
	const [u1, u2] = [myUserId, user2Id].sort((a, b) => a.localeCompare(b));
	const channelName = `chan_${u1}_${u2}`;

	const existing = dbChat.getExistingChannel(channelName);
	if (existing.length > 0)
		return ;
	dbChat.addNewChannel(channelName)
	const channelId = Number(dbChat.getExistingChannel(channelName)[0]?.id);
	dbChat.addNewChannelMembers(channelId, u1, u2);
}


const chatService = {
	getChannelInfo,
	getChatHistory,
	createPrivateChannel
};

export default chatService;
