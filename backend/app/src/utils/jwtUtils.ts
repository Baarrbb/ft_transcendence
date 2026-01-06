
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { runQuery } from './dbUtils.ts';
import { config } from '../config.ts'


const ACCESS_TOKEN_EXP_MIN = Number(config.accessTokenExpMin) || 15;
const JWT_SECRET = config.jwtSecret || 'your_secret_key';
const REFRESH_TOKEN_EXP_DAYS = Number(config.refreshTokenExpDays) || 7;

export async function generateAccessToken(userId: string) {
	const payload = {
		user_id: userId,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP_MIN * 60,
	};
	return jwt.sign(payload, JWT_SECRET);
}

export async function generateRefreshToken(userId: string) {
	const tokenId = randomUUID();
	const payload = {
		user_id: userId,
		token_id: tokenId,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXP_DAYS * 86400,
	};
	const token = jwt.sign(payload, JWT_SECRET);
	const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXP_DAYS * 86400000).toISOString();
	await runQuery(`
		INSERT INTO jwt (id, user_id, refresh_token, expires_at)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(user_id)
		DO UPDATE SET 
			id = excluded.id,
			refresh_token = excluded.refresh_token,
			expires_at = excluded.expires_at
	`, [tokenId, userId, token, expiresAt]);

	return tokenId;
}
