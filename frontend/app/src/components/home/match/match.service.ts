
import dbUsers from '../users/users.model.ts';
import dbMatch from './match.model.ts';
import type { BasicResponse } from '@shared/types/users.ts';
import { randomUUID } from 'crypto';


export function getStatusInvitations(myUserId: string) {
	try {
		const sentInvitations = dbMatch.getSentInvitations(myUserId);
		const acceptedInvitations = dbMatch.getAcceptedInvitations(myUserId);
		const receivedInvitations = dbMatch.getReceivedInvitations(myUserId)
			.map((invite: any) => {
				const user = dbUsers.getUserByUsername(invite.username);
				return {
					...invite,
					inGame: user ? user.in_game === 1 : false
				};
			});

		const allUsernames = new Set([
			...sentInvitations.map(u => u.username),
			...receivedInvitations.map(u => u.username),
			...acceptedInvitations.map(u => u.username)
		]);

		const statusList = [];
		for (const username of allUsernames) {
			const sent = sentInvitations.find(u => u.username === username);
			const accepted = acceptedInvitations.find(u => u.username === username);
			const received = receivedInvitations.find(u => u.username === username);
			if (sent)
				statusList.push({ username, status: 'sent' });
			else if (accepted)
				statusList.push({ username, status: 'accepted', matchId: accepted.match_id });
			else if (received)
				statusList.push({ username, status: received.inGame ? 'occupied' : 'received' });
		}

		return {
			success: true,
			message: "Invitations status",
			users: statusList
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export function getStatusInvitationUser(myUserId: string, username: string) {
	try {
		const userId = dbUsers.getUserIdByUsername(username);
		if (!userId) {
			return {
				success: false,
				message: "Can't find user"
			}
		}
		const user = dbUsers.getUserByUserId(userId.user_id);
		if (!user) {
			return {
				success: false,
				message: 'Fail retrieve user'
			}
		}
		// if (user && user.in_game === 1) {
		// 	return {
		// 		success: true,
		// 		message: "Invitation status",
		// 		invite: 'occupied'
		// 	}
		// }
		const invitation = dbMatch.existingInvitation(myUserId, userId.user_id);
		let type = 'none';
		let matchId = '';
		if (invitation) {
			if (invitation.from_user === myUserId && invitation.status === 'accepted') {
				type = 'accepted';
				matchId = dbMatch.getMatchId(myUserId, userId.user_id);
			}
			else if (invitation.from_user === myUserId)
				type = 'sent';
			else
				type = user.in_game ? 'occupied' : 'received';
		}
		// doit envoyer matchId aussi
		return {
			success: true,
			message: "Invitation status",
			invite: type,
			matchId: matchId
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function addInvitation(myUserId: string, username: string): Promise<BasicResponse> {
	try {
		const to_user_id = dbUsers.getUserIdByUsername(username);
		if (!to_user_id) {
			return {
				success: false,
				message: "Can't find user",
			}
		}
		dbMatch.createNewInvitation(myUserId, to_user_id.user_id);
		return {
			success: true,
			message: "Invitation sent"
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function cancelInvitation(myUserId: string, username: string): Promise<BasicResponse> {
	try {
		const to_user_id = dbUsers.getUserIdByUsername(username);
		if (!to_user_id) {
			return {
				success: false,
				message: "Can't find invitation",
			}
		}
		dbMatch.cancelInvitation(myUserId, to_user_id.user_id);

		return {
			success: true,
			message: "Invitation remove",
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function declineInvitation(myUserId: string, username: string): Promise<BasicResponse> {
	try {
		const from_user_id = dbUsers.getUserIdByUsername(username);
		if (!from_user_id) {
			return {
				success: false,
				message: "Can't find invitation",
			}
		}
		dbMatch.declineInvitation(myUserId, from_user_id.user_id);

		return {
			success: true,
			message: "Invitation remove",
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function addMatch(winner: string, loser: string, winnerScore: number, loserScore: number, abandon: boolean): Promise<BasicResponse> {
	try {
		const winnerUser = dbUsers.getUserByUsername(winner);
		const winnerTotalGames = dbMatch.getTotalMatch(winnerUser.user_id);
		const valWinnerTotalGames = winnerTotalGames['COUNT(*)'] ?? 0;
		const winnerDrift = 16 + (150 - 16) * Math.exp(-0.05 * valWinnerTotalGames);

		const loserUser = dbUsers.getUserByUsername(loser);
		const loserTotalGames = dbMatch.getTotalMatch(loserUser.user_id);
		const valLoserTotalGames = loserTotalGames['COUNT(*)'] ?? 0;
		const loserDrift = 16 + (150 - 16) * Math.exp(-0.05 * valLoserTotalGames);

		// dbMatch.deleteInvitation(winnerUser.user_id, loserUser.user_id);

		dbMatch.addNewMatch(winnerUser.user_id, loserUser.user_id, winnerScore, loserScore, winnerUser.elo, loserUser.elo, winnerDrift, loserDrift, abandon);

		const expectedWinner = 1 / (1 + Math.pow(10, (loserUser.elo - winnerUser.elo) / 400));
		const expectedLoser = 1 - expectedWinner;

		const newWinnerElo = Math.round(winnerUser.elo + winnerDrift * (1 - expectedWinner));
		const newLoserElo = Math.round(loserUser.elo + loserDrift * (0 - expectedLoser));

		dbUsers.updateElo(newWinnerElo, winnerDrift, winnerUser.user_id);
		dbUsers.updateElo(newLoserElo, loserDrift, loserUser.user_id);

		return {
			success: true,
			message: "Match added",
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export function removeInvitation(user1: string, user2: string) {
	try {
		const user1Id = dbUsers.getUserIdByUsername(user1);
		const user2Id = dbUsers.getUserIdByUsername(user2);
		if (!user1Id || !user2Id) {
			return {
				success: false,
				message: "Can't find user",
			}
		}

		const invite = dbMatch.getInvitation(user1Id.user_id, user2Id.user_id);
		if (invite.length > 0)
			dbMatch.deleteInvitation(user1Id.user_id, user2Id.user_id);
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function acceptInvitation(myUsername: string, myUserId: string, username: string) {
	try {
		const from_user_id = dbUsers.getUserIdByUsername(username);
		if (!from_user_id) {
			return {
				success: false,
				message: "Can't find invitation",
			}
		}
		dbMatch.acceptInvitation(myUserId, from_user_id.user_id);
		const matchId = randomUUID();
		dbMatch.updateMatchId(myUserId, from_user_id.user_id, matchId);

		return {
			success: true,
			message: "Invitation accepted",
			username: myUsername,
			matchId: matchId
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function getMatchId(myUserId: string, myUsername: string, username: string) {
	try {
		const to_user_id = dbUsers.getUserIdByUsername(username);
		if (to_user_id) {
			return {
				success: false,
				message: "Can't find invitation",
			}
		}

		const matchId = dbMatch.getMatchId(myUserId, to_user_id.user_id);

		return {
			success: true,
			message: "MatchId returned",
			myUsername: myUsername,
			matchId: matchId
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function getMatchHistory(myUserId: string) {
	try {
		const history = dbMatch.getHistory(myUserId);
		return {
			success: true,
			message: "Match history",
			match: history
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function getMatchHistoryUser(username: string) {
	try {
		const user_id = dbUsers.getUserIdByUsername(username);
		if (!user_id) {
			return {
				success: false,
				message: 'User not found'
			}
		}
		const history = dbMatch.getHistory(user_id.user_id);
		return {
			success: true,
			message: "Match history",
			match: history
		}
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

function getEvolutionUser(userId: string) {
	const matches = dbMatch.getEvolution(userId);
	const evolution = [];
	let i = 1;
	for (const match of matches) {
		evolution.push({ x: i, y: match.elo_before });
		i++;
	}
	const lastElo = dbUsers.getEloByUserId(userId);
	evolution.push({ x: i, y: lastElo.elo });
	return {
		success: true,
		message: "Match evolution",
		evolution
	}
}

export async function getMatchEvolution(myUserId: string) {
	try {
		return getEvolutionUser(myUserId);
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

export async function getMatchEvolutionUser(username: string) {
	try {
		const user_id = dbUsers.getUserIdByUsername(username);
		if (!user_id) {
			return {
				success: false,
				message: 'User not found'
			}
		}
		return getEvolutionUser(user_id.user_id);
	}
	catch (error) {
		// console.log(error.message);
		throw error;
	}
}

const matchService = {
	// getSentInvitations,
	// getReceivedInvitations,
	// getAcceptedInvitations,
	getStatusInvitations,
	getStatusInvitationUser,
	addInvitation,
	cancelInvitation,
	declineInvitation,
	addMatch,
	acceptInvitation,
	removeInvitation,
	getMatchId,
	getMatchHistory,
	getMatchEvolution,
	getMatchHistoryUser,
	getMatchEvolutionUser
};

export default matchService;
