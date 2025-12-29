
import { getQuery, runQuery } from '../../utils/dbUtils.ts'

interface User {
	id: number;
	user_id: string;
	created_at: string;
	username: string;
	email: string;
	password: string;
	link_avatar: string;
	online: number;
	remember: number;
	elo: number;
	elo_drift: number;
	google_id: string;
	isPasswd: boolean;
}

export type PublicUser = Omit<User, 'password'>;


export function getUsersByUsername(username: string): any[] {
	return runQuery('SELECT * FROM users WHERE username = ?', [username]);
}

export function getUsersByEmail(email: string): any[] {
	return runQuery('SELECT * FROM users WHERE email = ?', [email]);
}

export function createUser(email: string, username: string, hashedPassword: string, userId: string) {
	runQuery('INSERT INTO users (username, email, password, user_id) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, userId]);
}

export function getUserByUsername(username: string) {
	return getQuery('SELECT * FROM users WHERE username = ?', [username]);
}

export function getUserByEmail(email: string) {
	return getQuery('SELECT * FROM users WHERE email = ?', [email]);
}

// export function updateUserRemember(remember: boolean, userId: string) {
// 	runQuery('UPDATE users SET remember = ? WHERE user_id = ?', [remember ? 1 : 0, userId]);
// }

export function updatePassword(hashedPassword: string, user_id: string) {
	runQuery('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, user_id]);
}

export function getUserByUserId(userId: string) {
	return getQuery('SELECT * FROM users WHERE user_id = ?', [userId]);
}

export function updateUsername(newUsername: string, userId: string) {
	runQuery('UPDATE users SET username = ? WHERE user_id = ?', [newUsername, userId]);
}

export function updateEmail(newEmail: string, userId: string) {
	runQuery('UPDATE users SET email = ? WHERE user_id = ?', [newEmail, userId]);
}

export function updateAvatar(newLink: string, userId: string) {
	runQuery('UPDATE users SET link_avatar = ? WHERE user_id = ?', [newLink, userId]);
}

export function getUsersWithRestriction(restriction: string): any[] {
	const query: string = 'SELECT username, elo, link_avatar, user_id FROM users WHERE is_anon = 0';
	const fullQuery: string = query + restriction;
	return runQuery(fullQuery);
}

export function getUserIdFromUsername(username: string): any[] {
	return runQuery('SELECT user_id FROM users WHERE username = ?', [username]);
}

export function getUserIdByUsername(username: string): any {
	return getQuery('SELECT user_id FROM users WHERE username = ?', [username]);
}

export function getOnlineByUserId(userId: string): any {
	return getQuery(`SELECT online FROM users WHERE user_id = ?`, [userId]);
}

export function updateUserStatus(username: string, delta: number) {
	runQuery(`UPDATE users
		SET online = CASE
			WHEN online + ? < 0 THEN 0
			ELSE online + ?
		END
		WHERE username = ?`,
	[delta, delta, username]);
}

export function getOnlineNonFriends(user_id: string): any[] {
	return runQuery(`SELECT u.user_id, u.username, u.elo, u.link_avatar, u.online
		FROM users u
		WHERE u.online > 0
		AND u.user_id != ?
		AND u.user_id NOT IN (
			SELECT 
				CASE 
					WHEN requester_id = ? THEN addressee_id
					ELSE requester_id
				END AS other_user_id
			FROM friendships
			WHERE requester_id = ? OR addressee_id = ?
		)
		AND u.user_id NOT IN (
			SELECT blocked_id FROM blocked_users WHERE blocker_id = ?
		)
		AND u.user_id NOT IN (
			SELECT blocker_id FROM blocked_users WHERE blocked_id = ?
		)
	`, [user_id, user_id, user_id, user_id, user_id, user_id]);
}

export function updateElo(newElo: number, drift: number, user_id: string) {
	runQuery(`UPDATE users SET elo = ?, elo_drift = ? WHERE user_id = ?`, 
			[newElo.toFixed(2), drift, user_id]);
}

export function updateInGame(userId: string, inGame: boolean) {
	runQuery('UPDATE users SET in_game = ? WHERE user_id = ?', 
		[inGame ? 1 : 0, userId])
}

export function getNonFriends(user_id: string): any[] {
	return runQuery(`SELECT u.username, u.elo, u.link_avatar
		FROM users u
		WHERE u.user_id != ? AND is_anon = 0
		AND u.user_id NOT IN (
			SELECT 
				CASE 
					WHEN requester_id = ? THEN addressee_id
					ELSE requester_id
				END AS other_user_id
			FROM friendships
			WHERE requester_id = ? OR addressee_id = ?
		)
		AND u.user_id NOT IN (
			SELECT blocked_id FROM blocked_users WHERE blocker_id = ?
		)
		AND u.user_id NOT IN (
			SELECT blocker_id FROM blocked_users WHERE blocked_id = ?
		)
		ORDER BY u.username ASC
	`, [user_id, user_id, user_id, user_id, user_id, user_id]);
}

export function getUsernameByUserId(userId: string): any {
	return getQuery(`SELECT username FROM users WHERE user_id = ?`, [userId]);
}

export function createUserFromGoogle(google_id: string, username: string, email: string, avatar: string, userId: string): any {
	runQuery('INSERT INTO users (google_id, username, email, link_avatar, user_id) VALUES (?, ?, ?, ?, ?)', [google_id, username, email, avatar, userId]);
	return getUserByUserId(userId);
}

export function linkGoogleId(user_id: string, google_id: string) {
	runQuery(`UPDATE users SET google_id = ? WHERE user_id = ?`, 
			[google_id, user_id]);
}

export function getUserByGoogleId(google_id: string): any {
	return getQuery(`SELECT * FROM users WHERE google_id = ?`, [google_id]);
}

export function unlinkGoogleId(userId: string) {
	runQuery(`UPDATE users SET google_id = NULL WHERE user_id = ? `, [userId]);
}

export function anonymizeDataUser(userId: string) {
	const user = getQuery(`SELECT id FROM users WHERE user_id = ?`, [userId]);
	runQuery(`UPDATE users SET username = ?, 
				email = ?, 
				password = NULL, 
				link_avatar = 'avatar.jpg', 
				online = 0, 
				remember = 0, 
				google_id = NULL, 
				in_game = 0,
				is_anon = 1
			WHERE user_id = ?`,
		[`anon_user_${user.id}`, `deleted_${user.id}`, userId]);
}

export function getEloByUserId(userId: string): any {
	return getQuery(`SELECT elo FROM users WHERE user_id = ?`, [userId]);
}

export function getIsAnonByUserId(userId: string): any {
	return getQuery(`SELECT is_anon FROM users WHERE user_id = ?`, [userId]);
}

export function deleteDataUser(userId: string) {
	runQuery(`DELETE FROM users WHERE user_id = ?`, [userId]);
}

const dbUsers = {
	getUsersByUsername,
	getUsersByEmail,
	createUser,
	getUserByUsername,
	getUserByEmail,
	// updateUserRemember,
	updatePassword,
	getUserByUserId,
	updateUsername,
	updateEmail,
	updateAvatar,
	getUsersWithRestriction,
	getUserIdFromUsername,
	getUserIdByUsername,
	getOnlineByUserId,
	updateUserStatus,
	getOnlineNonFriends,
	updateElo,
	updateInGame,
	getNonFriends,
	getUsernameByUserId,
	createUserFromGoogle,
	linkGoogleId,
	getUserByGoogleId,
	unlinkGoogleId,
	anonymizeDataUser,
	getEloByUserId,
	getIsAnonByUserId,
	deleteDataUser
};

export default dbUsers;
