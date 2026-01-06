
import crypto from 'crypto';
import { runQuery } from './dbUtils.ts';

const SESSION_SECRET_KEY = 'yourSecretKey'; // faut que j'en chosisisse une 

async function generateSessionToken() {
	const sessionToken = crypto.randomBytes(64).toString('hex');
	const signedToken = crypto
		.createHmac('sha256', SESSION_SECRET_KEY)
		.update(sessionToken)
		.digest('hex');
	return signedToken;
}

function storeSessionToken(userId: string, token: string) {
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 7).toISOString(); // 7 days from now
	runQuery(`INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?) `
		, [userId, token, expiresAt]);
}

function validateSessionToken(token: string) {
	const session = runQuery(`SELECT * FROM sessions WHERE session_token = ?`, [token]);
	if (session.length === 0)
		throw new Error('Session not found');
	if (new Date(session.expires_at) < new Date())
		throw new Error('Session expired');
	if (session[0].last_active < new Date(Date.now() - 1000 * 60 * 30))
		throw new Error('Session not active anymore');
	return session[0].user_id;
}

function updateLastActivity(sessionToken: string) {
	const lastActive = new Date().toISOString();
	runQuery('UPDATE sessions SET last_active = ? WHERE session_token = ?', [lastActive, sessionToken]);
}


const sessionUtils = {
	generateSessionToken,
	storeSessionToken,
	validateSessionToken,
	updateLastActivity
};

export default sessionUtils;
