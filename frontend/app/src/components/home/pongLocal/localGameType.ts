
export interface LocalGame {

	isBotGame: boolean,
	botState: {
		targetY: number | null;
		reactionTimer: number;
		lastRefreshTime: number | undefined;
	}
	// botside: string;
	botDifficulty: number;

	isTournament: boolean,
	player1: string,
	player2: string,
	winner: string | undefined,
	loser: string | undefined,
	scoreMax: number,
	pause: boolean,
	paddlesPause : boolean,
	ballPause : boolean,
	start: boolean,
	intro: boolean,
	score: {
		right: number,
		left: number
	},
	playersReady: {
		player1: boolean,
		player2: boolean
	},
	ball: {
		radius: number,
		pos_x: number,
		pos_y: number,
		dir_x: number | undefined,
		dir_y: number
	},
	paddles: {
		right: {
			height: number,
			width: number,
			pos_x: number,
			pos_y: number,
			upPressed: boolean,
			downPressed: boolean,
		},
		left: {
			height: number,
			width: number,
			pos_x: number,
			pos_y: number,
			upPressed : boolean,
			downPressed : boolean,
		}
	},
}

export interface Tournament {
	nbRound: number;
	nbMatch: number;
	rounds: TournamentRound[];
}


export interface TournamentRound {
	roundIdx: number;
	matches: TournamentMatch[];
}

export interface TournamentMatch {
	matchIdx: number;
	matchIdGlobal: number;
	p1: string;
	p2: string;
	game: LocalGame | undefined;
	status: 'waiting' | 'playing' | 'finished';
}
