// ===== SHOW STATS =====
// Ce fichier permet d'afficher les stats d'un AUTRE joueur dans une popup
// (quand on clique sur un username dans le dashboard ou le chat)

import { catchHttpError } from '../../utils/catchError.ts';
import { matchService } from '../../services/match.ts';
import { renderStatsCard, fillBoxStats, populateGraph } from './render.ts';

// Affiche une popup avec la carte de stats d'un joueur
// Cree un fond semi-transparent, clique dessus = ferme la popup
export async function showUserStats(username: string) {
	const mainContent = document.getElementById('main-content');
	const backgroundCard = document.createElement('div');
	if (mainContent) {
		// Fond sombre cliquable pour fermer
		backgroundCard.className = `absolute inset-0 bg-gradient-to-b from-black/80 via-[#0a0a1f]/90 to-black/80 
		z-50 flex items-center justify-center
		opacity-0 transition-opacity duration-300`;
		backgroundCard.addEventListener('click', (e) => {
			if (e.target === backgroundCard)
				backgroundCard.remove(); // ferme si on clique a cote
		});
		// Insere la carte de stats dans la popup
		const profilCardWrapper = document.createElement('div');
		profilCardWrapper.innerHTML = renderStatsCard();
		profilCardWrapper.firstElementChild?.addEventListener('click', (e) => e.stopPropagation());
		backgroundCard.appendChild(profilCardWrapper);
		mainContent.appendChild(backgroundCard);
		// Animation d'apparition
		setTimeout(() => {
			requestAnimationFrame(() => {
			backgroundCard.classList.remove("opacity-0");
		})});
		await populateStats(username); // charge les stats du joueur
	}
}

// Recupere les stats d'un joueur via l'API et les affiche
async function populateStats(username: string) {
	try {
		// Recupere l'historique des matchs du joueur
		const response: any = await matchService.getMatchHistoryUser(username);
		if (response.success && response.match) {
			const totalGames = response.match.length;
			const wins = response.match.filter((m: any) => m.meWinner).length;
			fillBoxStats(totalGames, wins, response.match); // remplit les chiffres
			// Si le joueur a des matchs, on affiche le graphique ELO
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
