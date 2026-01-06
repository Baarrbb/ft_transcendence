
import { getQuery, runQuery } from '../../utils/dbUtils.ts'

// export interface User {
// 	user_id: number;
// 	username: string;
// 	email: string;
// 	level: number;
// 	friends: string; // ou string[] si c’est du JSON
// }

// export function getUsersByEmail(email: string): Promise<User[]> {
// 	return runQuery<User>('SELECT * FROM users WHERE email = ?', [email]);
// }

// export function runQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
// 	// exécution réelle de la requête
// }

// export async function getUsersByUsernameOrEmail(email: string, username: string): Promise<any[]> {
// 	return await runQuery('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
// }


export function createUserAuthentification(userId: string) {
	runQuery('INSERT INTO authentification (user_id) VALUES (?)', [userId]);
}

export function getUserAuthentificationRow(userId: string) {
	return getQuery('SELECT * FROM authentification WHERE user_id = ?', [userId]);
}

export function updateUserResetToken(userId: string, token: string, expiry: string) {
	runQuery(`UPDATE authentification SET reset_token = ?, reset_token_expiry = ? WHERE user_id = ?`,
		[token, expiry, userId]);
}

export function getUsersByResetToken(token: string): any[] {
	return runQuery(`SELECT * FROM authentification WHERE reset_token = ?`, [token]);
}

export function updateResetToken(user_id: string) {
	runQuery('UPDATE authentification SET reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?', [user_id]);
}

export function deleteSessionBySessionToken(sessionToken: string) {
	runQuery('DELETE FROM sessions WHERE session_token = ?', [sessionToken]);
}

export function deleteJWTByUserId(userId: string) {
	runQuery('DELETE FROM jwt WHERE user_id = ?', [userId]);
}

export function update2FAByUserId(status: boolean, totp_secret: string, user_id: string) {
	if (status)
		runQuery('UPDATE authentification SET totp_secret = ?, is_totp_enabled = ? WHERE user_id = ?', [totp_secret, 1, user_id]);
	else
		runQuery('UPDATE authentification SET totp_secret = ?, is_totp_enabled = ? WHERE user_id = ?', [null, 0, user_id]);
}

export function deleteDataAuth(userId: string, sessionToken: string) {
	runQuery(`DELETE FROM authentification WHERE user_id = ?`, [userId]);
	runQuery('DELETE FROM sessions WHERE user_id = ? AND session_token != ?', [userId, sessionToken]);
}

const dbAuth = {
	createUserAuthentification,
	getUserAuthentificationRow,
	updateUserResetToken,
	getUsersByResetToken,
	updateResetToken,
	deleteSessionBySessionToken,
	deleteJWTByUserId,
	update2FAByUserId,
	deleteDataAuth
};

export default dbAuth;
