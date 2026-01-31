

import { catchHttpError } from '../../utils/catchError.ts';
import { matchService } from '../../services/match.ts';
import { renderStatsCard, fillBoxStats, populateGraph } from './render.ts';

export async function showUserStats(username: string) {
	const mainContent = document.getElementById('main-content');
	const backgroundCard = document.createElement('div');
	if (mainContent) {
		backgroundCard.className = `absolute inset-0 bg-gradient-to-b from-black/80 via-[#0a0a1f]/90 to-black/80 
		z-50 flex items-center justify-center
		opacity-0 transition-opacity duration-300`;
		backgroundCard.addEventListener('click', (e) => {
			if (e.target === backgroundCard)
				backgroundCard.remove();
		});
		const profilCardWrapper = document.createElement('div');
		profilCardWrapper.innerHTML = renderStatsCard();
		profilCardWrapper.firstElementChild?.addEventListener('click', (e) => e.stopPropagation());
		backgroundCard.appendChild(profilCardWrapper);
		mainContent.appendChild(backgroundCard);
		setTimeout(() => {
			requestAnimationFrame(() => {
			backgroundCard.classList.remove("opacity-0");
		})});
		await populateStats(username);
	}
}

async function populateStats(username: string) {
	try {
		const response: any = await matchService.getMatchHistoryUser(username);
		if (response.success && response.match) {
			const totalGames = response.match.length;
			const wins = response.match.filter((m: any) => m.meWinner).length;
			fillBoxStats(totalGames, wins, response.match);
			if (totalGames > 0) {
				const graphElo: any = await matchService.getEvolutionUser(username);
				if (graphElo.success && graphElo.evolution)
					populateGraph(totalGames, graphElo.evolution);
			}
		}
	}
	catch (error) {
		catchHttpError('Match history error:', error);
	}
}
