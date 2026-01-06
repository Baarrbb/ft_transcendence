
import { runQuery, getQuery } from '../../utils/dbUtils.ts'


export function createNewInvitation(myUserId: string, userToInviteId: string) {
	runQuery('INSERT INTO match_invitation (from_user, to_user, status) VALUES (?, ?, ?)', 
		[myUserId, userToInviteId, 'pending']);
}

export function existingInvitation(myUserId: string, userId: string) {
	return getQuery(`SELECT * FROM match_invitation WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)`, 
		[myUserId, userId, userId, myUserId]);
}

export function getSentInvitations(myUserId: string): any[] {
	return runQuery(`SELECT u.username FROM users u
		JOIN match_invitation mi ON u.user_id = mi.to_user WHERE mi.from_user = ?
		AND mi.status = 'pending'`, 
	[myUserId]);
}

export function getAcceptedInvitations(myUserId: string): any[] {
	return runQuery(`SELECT u.username, mi.match_id FROM users u
		JOIN match_invitation mi ON u.user_id = mi.to_user WHERE mi.from_user = ?
		AND mi.status = 'accepted'`, 
	[myUserId]);
}

export function getReceivedInvitations(myUserId: string): any[] {
	return runQuery(`SELECT u.username FROM users u
		JOIN match_invitation mi ON u.user_id = mi.from_user WHERE mi.to_user = ?
		AND mi.status = 'pending'`,
	[myUserId]);
}

export function cancelInvitation(myUserId: string, to_user_id: string) {
	runQuery(`DELETE FROM match_invitation WHERE from_user = ? AND to_user = ?`, 
		[myUserId, to_user_id]);
}

export function declineInvitation(myUserId: string, from_user_id: string) {
	runQuery(`DELETE FROM match_invitation WHERE from_user = ? AND to_user = ?`, 
		[from_user_id, myUserId]);
}

export function getTotalMatch(user_id: string): any {
	return getQuery(`SELECT COUNT(*) FROM match WHERE winner_id = ? OR loser_id = ?`, [user_id, user_id])
}

export function addNewMatch(winnerUserId: string, loserUserId: string,
	winnerScore: number, loserScore: number,
	winnerElo: string, loserElo: string,
	winnerDrift: number, loserDrift: number, abandon: boolean
) {
	runQuery(`INSERT INTO match (winner_id, loser_id, winner_score, loser_score, winner_elo_before, loser_elo_before, winner_drift, loser_drift, abandon)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
		[winnerUserId, loserUserId, winnerScore, loserScore, winnerElo, loserElo, winnerDrift, loserDrift, abandon ? 1 : 0]);
}

export function acceptInvitation(myUserId: string, from_user_id: string) {
	runQuery(`UPDATE match_invitation SET status = 'accepted' WHERE from_user = ? AND to_user = ?`, 
		[from_user_id, myUserId]);
}

export function deleteInvitation(userId1: string, userId2: string) {
	runQuery('DELETE FROM match_invitation WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)',
		[userId1, userId2, userId2, userId1]);
}

export function updateMatchId(to_user_id: string, from_user_id: string, matchId: string) {
	runQuery('UPDATE match_invitation SET match_id = ? WHERE from_user = ? AND to_user = ?', 
		[matchId, from_user_id, to_user_id])
}

export function getMatchId(from_user_id: string, to_user_id: string): any {
	return getQuery('SELECT match_id FROM match_invitation WHERE from_user = ? AND to_user = ?',
		[from_user_id, to_user_id])
}

export function getInvitation(user1_id: string, user2_id: string): any[] {
	return runQuery(`SELECT * FROM match_invitation WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)`, 
		[user1_id, user2_id, user2_id, user1_id]);
}

export function getHistory(myUserId: string): any[] {
	return runQuery(`
		SELECT 
			m.winner_score,
			m.loser_score,
			m.abandon,
			m.created_at,
			COALESCE(w.username, 'deleted_user') AS winner_username,
			COALESCE(l.username, 'deleted_user') AS loser_username,
			CASE 
				WHEN m.winner_id = ? THEN 1
				ELSE 0
			END AS meWinner
		FROM match m
		LEFT JOIN users w ON m.winner_id = w.user_id
		LEFT JOIN users l ON m.loser_id = l.user_id

		WHERE m.winner_id = ? OR m.loser_id = ?
		ORDER BY m.created_at DESC;`,
		[myUserId, myUserId, myUserId]);
}

export function getEvolution(myUserId: string): any[] {
	return runQuery(`
		SELECT
			CASE
				WHEN winner_id = ? THEN winner_elo_before
				ELSE loser_elo_before
			END AS elo_before
		FROM match
		WHERE winner_id = ? OR loser_id = ?
		ORDER BY created_at ASC`,
		[myUserId, myUserId, myUserId])
}

export function deleteDataMatchInvitation(userId: string) {
	runQuery(`DELETE FROM match_invitation WHERE from_user = ? OR to_user = ?`, [userId, userId]);
}

export function getHistoryWOUsername(myUserId: string): any[] {
	return runQuery(`
		SELECT 
			m.winner_score,
			m.loser_score,
			m.abandon,
			m.created_at,
			CASE 
				WHEN m.winner_id = ? THEN 1
				ELSE 0
			END AS meWinner
		FROM match m
		LEFT JOIN users w ON m.winner_id = w.user_id
		LEFT JOIN users l ON m.loser_id = l.user_id

		WHERE m.winner_id = ? OR m.loser_id = ?
		ORDER BY m.created_at DESC;`,
		[myUserId, myUserId, myUserId]);
}

const dbMatch = {
	createNewInvitation,
	existingInvitation,
	getSentInvitations,
	getReceivedInvitations,
	getAcceptedInvitations,
	cancelInvitation,
	declineInvitation,
	getTotalMatch,
	addNewMatch,
	acceptInvitation,
	deleteInvitation,
	updateMatchId,
	getMatchId,
	getInvitation,
	getHistory,
	getEvolution,
	deleteDataMatchInvitation,
	getHistoryWOUsername
};

export default dbMatch;
