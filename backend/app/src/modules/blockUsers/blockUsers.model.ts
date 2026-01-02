
import { runQuery } from '../../utils/dbUtils.ts'


export function getBlockedUsersIdByMe(userId: string): any[] {
	return runQuery('SELECT blocked_id FROM blocked_users WHERE blocker_id = ?', [userId]);
}

export function getBlockedMeUsersId(userId: string): any[] {
	return runQuery('SELECT blocker_id FROM blocked_users WHERE blocked_id = ?', [userId]);
}

export function getBlockedUsers(userId: string): any[] {
	return runQuery(
		`SELECT u.username, b.created_at FROM users u
		 JOIN blocked_users b ON u.user_id = b.blocked_id
		 WHERE b.blocker_id = ?
		 ORDER BY b.created_at ASC`,
		[userId]
	);
}

export function checkIfBlockedId(myUserId: string, userId: string): any[] {
	return runQuery('SELECT * FROM blocked_users WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
		[myUserId, userId, userId, myUserId]);
}

export function checkIfIBlockedUser(myUserId: string, userId: string): any[] {
	return runQuery('SELECT 1 FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?', [myUserId, userId])
}

export function createBlockedUser(myUserId: string, userId: string) {
	return runQuery('INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)', [myUserId, userId]);
}

export function deleteBlockedUser(myUserId: string, userId: string) {
	return runQuery('DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?', [myUserId, userId]);
}

export function deleteDataBlockedUsers(userId: string) {
	runQuery(`DELETE FROM blocked_users WHERE blocker_id = ? OR blocked_id = ?`, [userId, userId]);
}

const dbBlockUsers = {
	getBlockedUsersIdByMe,
	getBlockedMeUsersId,
	getBlockedUsers,
	checkIfBlockedId,
	checkIfIBlockedUser,
	createBlockedUser,
	deleteBlockedUser,
	deleteDataBlockedUsers
};

export default dbBlockUsers;