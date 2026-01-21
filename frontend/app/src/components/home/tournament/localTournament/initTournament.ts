
import type { Tournament, TournamentRound, TournamentMatch } from '../../pongLocal/localGameType.ts';

function shuffleArray(players: string[]) {
	for (let i = players.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[players[i], players[j]] = [players[j], players[i]];
	}

	for (let i = 0; i < players.length; i += 2) {
		if (players[i] == players[i + 1])
			shuffleArray(players);
	}

}

export function initTournament(players: string[]): Tournament {
	if (players.length === 6)
		players.push('Bye', 'Bye');

	shuffleArray(players);

	const rounds: TournamentRound[] = [];
	let globalMatchId: number = 1;

	let firstRound: TournamentMatch[] = [];
	for (let i = 0; i < players.length; i += 2)
		firstRound.push({ matchIdx: i / 2, matchIdGlobal: globalMatchId++, p1: players[i], p2: players[i + 1], game: undefined, status: 'waiting' });
	rounds.push({ roundIdx: 0, matches: firstRound });

	let nbPrevMatch: number = firstRound.length;
	let roundIdx: number = 1;
	while (nbPrevMatch > 1) {
		const nbMatch = Math.ceil(nbPrevMatch / 2);
		rounds.push({ roundIdx: roundIdx, matches: Array.from({ length: nbMatch }, (_, i) => ({
				matchIdx: i, matchIdGlobal: globalMatchId++, p1: '', p2: '', game: undefined, status: 'waiting'
			}))
		});
		nbPrevMatch = nbMatch;
		roundIdx++;
	}

	resolveBye(rounds);

	return {
		nbRound: rounds.length,
		nbMatch: --globalMatchId,
		rounds: rounds
	}
}

function resolveBye(rounds: TournamentRound[]) {
	const firstRound = rounds[0];
	const secondRound = rounds[1];

	if (!secondRound)
		return;

	firstRound.matches.forEach((match, idx) => {
		if (match.p1 === 'Bye' && match.p2 !== 'Bye') {
			advancePlayer(secondRound, idx, match.p2);
			match.status = 'finished';
		}
		else if (match.p2 === 'Bye' && match.p1 !== 'Bye') {
			advancePlayer(secondRound, idx, match.p1);
			match.status = 'finished';
		}
	});
}

function advancePlayer( nextRound: TournamentRound, matchIdx: number, player: string ) {
	const targetMatch = nextRound.matches[Math.floor(matchIdx / 2)];

	if (matchIdx % 2 === 0)
		targetMatch.p1 = player;
	else
		targetMatch.p2 = player;
}
