
import { getQuery, runQuery } from '../../utils/dbUtils.ts'

export function getChannelFromId(channelId: number): any {
	return getQuery(`SELECT * FROM channels WHERE id = ?`, [channelId]);
}

export function addMessage(fromUserId: string, message: string, channelId: number, battle: string | null, channel_name: string) {
	runQuery(`INSERT INTO messages (sender_id, msg, chat_id, type, channel_name) VALUES (?, ?, ?, ?, ?)`, 
		[fromUserId, message, channelId, battle, channel_name]);
}

export function getUsersIdFromChannelId(channelId: number): any[] {
	return runQuery(`SELECT user_id FROM channel_members WHERE channel_id = ?`, [channelId]);
}

export function getChannelInfoByChannelName(channel_name: string): any {
	return getQuery(`SELECT id FROM channels WHERE channel_name = ?`, [channel_name])
}

export function getChatHistoryByChannelId(channelId: string) {
	return runQuery(`SELECT messages.*, users.username FROM messages
		JOIN users ON messages.sender_id = users.user_id
		WHERE messages.chat_id = ?
		ORDER BY messages.created_at ASC`,
		[channelId]);
}

export function getExistingChannel(channelName: string): any[] {
	return runQuery(`SELECT id FROM channels WHERE channel_name = ? AND is_group = 0`,
		[channelName]);
}

export function addNewChannel(channelName: string) {
	runQuery('INSERT INTO channels (channel_name, is_group) VALUES (?, ?)', [channelName, 0]);
}

export function addNewChannelMembers(channelId: number, u1: string, u2: string) {
	runQuery('INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?), (?, ?)',
		[channelId, u1 , channelId, u2 ]);
}

export function getChannelId(userId1: string, userId2: string): any {
	return getQuery(`SELECT id FROM channels
		WHERE (channel_name = ? OR channel_name = ?) AND is_group = 0`, [`chan_${userId1}_${userId2}`, `chan_${userId2}_${userId1}`]);
}

export function deleteAllChannel(channelId: number) {
	runQuery(`DELETE FROM channels WHERE id = ?`, [channelId]);
	runQuery(`DELETE FROM channel_members WHERE channel_id = ?`, [channelId]);
	runQuery(`DELETE FROM messages WHERE chat_id = ?`, [channelId]);
}

export function getAllChannelId(userId: string): any[] {
	return runQuery(`SELECT DISTINCT cm.channel_id FROM channel_members cm
		JOIN channels c ON c.id = cm.channel_id
		WHERE cm.channel_id IN (
			SELECT channel_id FROM channel_members
			WHERE user_id = ?
		) AND c.is_group != 1 `, [userId]);
}

export function deleteFromGroup(userId: string) {
	runQuery(`DELETE FROM channel_members WHERE user_id = ?`, [userId]);
	runQuery(`DELETE FROM messages WHERE sender_id = ?`, [userId]);
}

export function getMyMessages(userId: string): any[] {
	return runQuery(`SELECT msg, created_at FROM messages WHERE sender_id = ?`, [userId]);
}

export function updateRead(channelId: string, userId: string) {
	runQuery(`UPDATE messages SET is_read = 1 WHERE chat_id = ? AND sender_id != ?`, [channelId, userId])
}

export function getOtherUserIdFromChannelId(channelId: number, userId: string) {
	return runQuery(`SELECT user_id FROM channel_members WHERE channel_id = ? AND user_id != ?`, [channelId, userId]);
}

const dbChat = {
	getChannelFromId,
	addMessage,
	getUsersIdFromChannelId,
	getChannelInfoByChannelName,
	getChatHistoryByChannelId,
	getExistingChannel,
	addNewChannel,
	addNewChannelMembers,
	getChannelId,
	deleteAllChannel,
	getAllChannelId,
	deleteFromGroup,
	getMyMessages,
	updateRead,
	getOtherUserIdFromChannelId
};

export default dbChat;