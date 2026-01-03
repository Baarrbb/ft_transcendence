
import { runQuery, getQuery } from '../../utils/dbUtils.ts'


// export function getPendingInvitationWithMyId(userId: string): any[] {
// 	return runQuery(`SELECT 
// 		CASE 
// 			WHEN from_user = ? THEN to_user
// 			ELSE from_user
// 		END AS other_user_id
// 		FROM invitation
// 		WHERE from_user = ? OR to_user = ?`,
// 		[userId, userId, userId]);
// }

export function existingInvitation(myUserId: string, userId: string): any[] {
	return runQuery(`SELECT * FROM invitation WHERE (to_user = ? AND from_user = ?) OR (from_user = ? AND to_user = ?)`,
		[myUserId, userId, myUserId, userId]);
}

export function createInvitation(myUserId: string, userId: string) {
	runQuery('INSERT INTO invitation (from_user, to_user) VALUES (?, ?)',
			[myUserId, userId]);
}

export function getSentInvitations(myUserId: string): any[] {
	return runQuery(`SELECT u.username FROM users u
		JOIN invitation i ON u.user_id = i.to_user WHERE i.from_user = ?`,
	[myUserId]);
}

export function getReceivedInvitations(myUserId: string): any[] {
	return runQuery(`SELECT u.username FROM users u
		JOIN invitation i ON u.user_id = i.from_user WHERE i.to_user = ?`,
	[myUserId]);
}

// export function getPendingInvitationFromMe(userId: string): any[] {
// 	return runQuery(`SELECT * FROM invitation WHERE from_user = ? ORDER BY created_at DESC`,
// 		[userId]);
// }

// export function getPendingInvitationToMe(userId: string): any[] {
// 	return runQuery(`SELECT * FROM invitation WHERE to_user = ? ORDER BY created_at DESC`,
// 		[userId]);
// }

export function getMyFriendsId(userId: string): any[] {
	return runQuery(`SELECT 
		CASE 
			WHEN requester_id = ? THEN addressee_id
			ELSE requester_id
		END AS other_user_id
		FROM friendships
		WHERE requester_id = ? OR addressee_id = ?`,
		[userId, userId, userId]);
}

export function deleteInvitation(myUserId: string, userId: string) {
	return runQuery(`DELETE FROM invitation WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)`,
		[myUserId, userId, userId, myUserId]);
}

export function deleteInvitationFromId(inviteId: string) {
	return runQuery(`DELETE FROM invitation WHERE id = ?`,[inviteId]);
}

export function getFriendship(myUserId: string, userId: string): any[] {
	return runQuery('SELECT * FROM friendships WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)', 
		[myUserId, userId, userId, myUserId]);
}

export function deleteFriendship(myUserId: string, userId: string) {
	return runQuery('DELETE FROM friendships WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)',
		[myUserId, userId, userId, myUserId]);
}

export function deleteFriendshipFromId(friendshipId: string) {
	return runQuery(`DELETE FROM friendships WHERE id = ?`,[friendshipId]);
}

export function findInvitation(myUserId: string, userId: string) {
	return getQuery(`SELECT * FROM invitation WHERE from_user = ? AND to_user = ?`,
		[userId, myUserId]);
}

export function createFriendship(myUserId: string, userId: string) {
	return runQuery(`INSERT INTO friendships (requester_id, addressee_id) VALUES (?, ?)`,
		[userId, myUserId]);
}

// export function getFriendshipsWithRestriction(myUserId: string, restrict: string): any[] {
// 	const query: string = `
// 		SELECT u.user_id, u.username, u.elo, u.online, u.link_avatar, f.created_at
// 		FROM users u
// 		JOIN (
// 			SELECT requester_id AS friend_id, created_at FROM friendships WHERE addressee_id = ?
// 			UNION
// 			SELECT addressee_id AS friend_id, created_at FROM friendships WHERE requester_id = ?
// 		)
// 		f ON u.user_id = f.friend_id`;
// 	const fullQuery: string = query + restrict;
// 	console.log(fullQuery);
// 	return runQuery(fullQuery, [myUserId, myUserId]);
// }

export function getFriendshipsWithRestriction(myUserId: string, restrict: string, sort?: string): any[] {
	let query = `SELECT u.user_id, u.username, u.elo, u.online, u.link_avatar, u.is_anon, f.created_at`;

	if (sort === 'message') {
		query += `,( SELECT MAX(e.created_at)
		FROM (
			SELECT m.created_at FROM messages m
			JOIN channel_members cm1 ON cm1.channel_id = (
				SELECT cmx.channel_id FROM channel_members cmx
				WHERE cmx.user_id = ?
				AND cmx.channel_id IN (
					SELECT cmy.channel_id FROM channel_members cmy WHERE cmy.user_id = u.user_id
				)
				LIMIT 1
			)
			WHERE m.chat_id = cm1.channel_id

			UNION ALL

			SELECT i.created_at FROM match_invitation i
			WHERE (i.from_user = u.user_id AND i.to_user = ?) OR (i.from_user = ? AND i.to_user = u.user_id)
		) AS e
		) AS last_event`
	}
	
	query += `
		FROM users u
		JOIN (
			SELECT requester_id AS friend_id, created_at FROM friendships WHERE addressee_id = ?
			UNION
			SELECT addressee_id AS friend_id, created_at FROM friendships WHERE requester_id = ?
		)
		f ON u.user_id = f.friend_id`;
	const fullQuery: string = query + restrict;
	// console.log(fullQuery);
	const params = sort === 'message' ? [myUserId, myUserId, myUserId, myUserId, myUserId] : [myUserId, myUserId]
	return runQuery(fullQuery, params);
}

export function getOnlineFriends(user_id: string): any[] {
	return runQuery(`SELECT u.username, u.elo, u.link_avatar, u.online FROM users u
		JOIN (
			SELECT requester_id AS friend_id, created_at FROM friendships WHERE addressee_id = ?
			UNION
			SELECT addressee_id AS friend_id, created_at FROM friendships WHERE requester_id = ?
		)
		f ON u.user_id = f.friend_id
		WHERE u.online > 0`, [user_id, user_id]);
}

export function deleteDataFriendsAndInvite(userId: string) {
	runQuery(`DELETE FROM friendships WHERE requester_id = ? OR addressee_id = ?`, [userId, userId]);
	runQuery(`DELETE FROM invitation WHERE from_user = ? OR to_user = ?`, [userId, userId]);
}

export function deleteDataInvite(userId: string) {
	runQuery(`DELETE FROM invitation WHERE from_user = ? OR to_user = ?`, [userId, userId]);
}

export function getFriendsUsername(userId: string): any[] {
	return runQuery(`
		SELECT u.username, f.created_at FROM friendships f
		JOIN users u ON u.user_id = f.addressee_id
		WHERE f.requester_id = ?
		UNION
		SELECT u.username, f.created_at FROM friendships f
		JOIN users u ON u.user_id = f.requester_id
		WHERE f.addressee_id = ?
		`,
	[userId, userId])
}

const dbFriends = {
	// getPendingInvitationWithMyId,
	existingInvitation,
	createInvitation,
	getSentInvitations,
	getReceivedInvitations,
	// getPendingInvitationFromMe,
	// getPendingInvitationToMe,
	getMyFriendsId,
	deleteInvitation,
	getFriendship,
	deleteFriendship,
	deleteInvitationFromId,
	findInvitation,
	createFriendship,
	deleteFriendshipFromId,
	getFriendshipsWithRestriction,
	getOnlineFriends,
	deleteDataFriendsAndInvite,
	deleteDataInvite,
	getFriendsUsername
};

export default dbFriends;
