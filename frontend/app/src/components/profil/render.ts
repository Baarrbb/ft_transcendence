
import type { UserResponse } from '@shared/types/users.ts';
import { usersService } from '../../services/users.ts';
import { matchService } from '../../services/match.ts';
import { catchHttpError } from '../../utils/catchError.ts';
import { formatDateToLocal } from '../../utils/formatDate.ts'
import { setupProfilListeners } from './listeners.ts'
import ApexCharts from "apexcharts";

function renderUserCard(): string {
	return /*ts*/`
		<div class="flex flex-col flex-1 min-h-0 text-[#d4ced4] w-full max-w-[400px] bg-[#02010f]/80 backdrop-blur-sm border border-[var(--color-primary)] rounded-2xl shadow-xl">
			<div class="flex-shrink-0 px-6 py-4 border-b border-[var(--color-primary)]/30">
				<h3 class="text-xl font-display uppercase tracking-wide text-[var(--color-primary-light)] text-center relative">
					<span class="relative z-10 backdrop-blur-sm px-4">User Profile</span>
					<div class="absolute inset-0 flex items-center">
						<div class="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
					</div>
				</h3>
			</div>

			<div class="p-6 space-y-2 overflow-auto min-h-0 custom-scrollbar flex-1">
				<div class="text-center">
					<div class="relative inline-block">
						<div class="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--color-primary)] mx-auto bg-[var(--color-primary)]">
							<img id="user-avatar" src="" alt="User Avatar" class="w-full h-full object-cover">
						</div>
						<form id="avatar-form">
							<button id="change-avatar-btn" type="button"
								class="cursor-pointer absolute bottom-0 right-0 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-[#0c0511] w-8 h-8 rounded-full flex items-center justify-center transition-colors">
								📷
							</button>
							<input type="file" id="avatar-input" accept="image/*" class="hidden">
						</form>
					</div>
				</div>

				<div class="space-y-3">
					<label class="text-sm font-semibold text-[var(--color-primary)]">Username</label>
					<div class="flex gap-2">
						<input type="text" id="username-input" value="username"
							class="flex-1 p-3 bg-[var(--color-primary-bg)] border border-[var(--color-primary)] rounded-lg text-[#d4ced4] focus:border-[var(--color-primary)] focus:outline-none transition-colors">
						<button id="update-username-btn"
							class="cursor-pointer bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-[#0c0511] font-bold px-4 py-3 rounded-lg hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-300">
							✓
						</button>
					</div>
				</div>

				<div class="space-y-3">
					<label class="text-sm font-semibold text-[var(--color-primary)]">Email</label>
					<div class="p-3 bg-[#1a0c24]/50 border border-[var(--color-primary)]/20 rounded-lg">
						<p id="user-email" class="text-[var(--color-primary-light)] font-mono">user@example.com</p>
						<p class="text-xs text-[#888] mt-1">Email can be changed in Settings</p>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4 mt-auto">
					<div class="bg-[#1a0c24]/50 rounded-lg p-3 border border-[var(--color-primary)]/20 text-center">
						<p class="text-2xl font-bold text-[var(--color-primary-light)]" id="total-games"></p>
						<p class="text-xs text-[#888]">Total Games</p>
					</div>

					<div class="bg-[#1a0c24]/50 rounded-lg p-3 border border-[var(--color-primary)]/20 flex items-center">
						<div class="flex-1 flex flex-col items-center justify-center">
							<p id="win-rate" class="text-2xl font-bold "></p>
							<p class="text-xs text-[#888]">Win Rate</p>
						</div>

						<div class="w-2 h-12 bg-[var(--color-primary-bg)] rounded-full overflow-hidden flex ml-3">
							<div id="win-rate-bar" class=" transition-all w-full self-end" style="height: 0%"></div>
						</div>
					</div>
				</div>

				<div id="achievements-row" class="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 justify-center text-sm select-none text-center">
					<span id="ach-first-win" title="First Win" class="opacity-30 transition-opacity cursor-default">
						🥇 First Win
					</span>

					<span id="ach-on-fire" title="On Fire (5 win streak)" class="opacity-30 transition-opacity cursor-default">
						🔥 On Fire
					</span>

					<span id="ach-grinder" title="Veteran (50 games played)" class="opacity-30 transition-opacity cursor-default">
						🧱 Veteran
					</span>

					<span id="ach-top-50" title="Addicted (100 games played)" class="opacity-30 transition-opacity cursor-default">
						💯 Addicted
					</span>
				</div>
			</div>
		</div>
	`;
}

export function renderStatsCard(): string {
	return /*ts*/`
		<div class="flex flex-col flex-1 min-h-0 text-[#d4ced4] w-full max-w-[400px] bg-[#02010f]/80 backdrop-blur-sm border border-[var(--color-primary)] rounded-2xl shadow-xl">
			<div class="flex-shrink-0 px-6 py-4 border-b border-[var(--color-primary)]/30">
				<h3 class="text-xl font-display uppercase tracking-wide text-[var(--color-primary-light)] text-center relative">
					<span class="relative z-10 backdrop-blur-sm px-4">Player Statistics</span>
					<div class="absolute inset-0 flex items-center">
						<div class="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
					</div>
				</h3>
			</div>

			<div class="p-6 flex flex-col flex-1 min-h-0">
					<div id='stat-graph' class='hidden flex-1 w-full'></div>
					<div id="no-matches-graph" class="hidden flex flex-col items-center justify-center text-center space-y-4 flex-1">
						<div class="w-32 h-32 border-4 border-dashed border-[var(--color-primary)] rounded-full flex items-center justify-center">
							<span class="text-4xl">📊</span>
						</div>
						<div>
							<h4 class="text-lg font-semibold text-[var(--color-primary-light)] mb-2">Statistics Graph</h4>
							<p class="text-sm text-[#888] max-w-xs">
								Player evolution graph will be displayed here. 
								Track your progress over time!
							</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 w-full max-w-sm mt-auto">
						<div class="bg-[#1a0c24]/50 rounded-lg p-4 border border-[var(--color-primary)]/20">
							<p id ='best-streak' class="text-lg font-bold text-[var(--color-primary-light)]"></p>
							<p class="text-xs text-[#888]">Best Win Streak</p>
						</div>
						<div class="bg-[#1a0c24]/50 rounded-lg p-4 border border-[var(--color-primary)]/20">
							<p id='current-streak' class="text-lg font-bold text-blue-400"></p>
							<p class="text-xs text-[#888]">Current Win Streak</p>
						</div>
						<div class="bg-[#1a0c24]/50 rounded-lg p-4 border border-[var(--color-primary)]/20">
							<p id='total-wins' class="text-lg font-bold text-green-400"></p>
							<p class="text-xs text-[#888]">Wins</p>
						</div>
						<div class="bg-[#1a0c24]/50 rounded-lg p-4 border border-[var(--color-primary)]/20">
							<p id='total-loss' class="text-lg font-bold text-red-400"></p>
							<p class="text-xs text-[#888]">Losses</p>
						
					</div>
				</div>
			</div>
		</div>
	`;
}

function renderMatchHistoryCard(): string {
	return /*ts*/`
		<div class="flex flex-col flex-1 min-h-0 text-[#d4ced4] w-full max-w-[400px] bg-[#02010f]/80 backdrop-blur-sm border border-[var(--color-primary)] rounded-2xl shadow-xl">
			<div class="flex-shrink-0 px-6 py-4 border-b border-[var(--color-primary)]/30">
				<h3 class="text-xl font-display uppercase tracking-wide text-[var(--color-primary-light)] text-center relative">
					<span class="relative z-10 backdrop-blur-sm px-4">Match History</span>
					<div class="absolute inset-0 flex items-center">
						<div class="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
					</div>
				</h3>
			</div>

			<div class="p-6 overflow-auto max-h-[70vh] min-h-0 custom-scrollbar">
				<div id="match-history-list" class="space-y-3"></div>
				<div id="no-matches" class="text-center py-8 hidden">
					<p class="text-[#888]">No matches played yet</p>
					<p class="text-xs text-[#666]">Start playing to see your history!</p>
				</div>
			</div>
		</div>
	`;
}

export function renderProfil(): string {
	return /*ts*/`
		<div id="profil-loader" class="flex justify-center items-center h-full">
			<span class="text-[var(--color-primary)] text-xl">Chargement...</span>
		</div>

		<div id="profil-content" class="flex flex-col w-full p-4 overflow-y-auto custom-scrollbar max-h-[calc(100vh-1rem)]">

			<div class="text-center mb-8 flex-shrink-0">
				<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 relative">
					<span class="relative z-10">Profile</span>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</h2>
			</div>

			<div class="flex flex-col lg:flex-row gap-6 w-full justify-center items-stretch max-w-7xl mx-auto h-full">
				<div class="flex-1 flex flex-col min-h-0">
					${renderUserCard()}
				</div>
				<div class="flex-1 flex flex-col min-h-0">
					${renderStatsCard()}
				</div>
				<div class="flex-1 flex flex-col min-h-0">
					${renderMatchHistoryCard()}
				</div>
			</div>
		</div>
	`;
}


function computeStreaks(history: any[]) {
	let currentStreak = 0;
	let bestStreak = 0;

	for (let i = 0; i < history.length; i++) {
		if (history[i].meWinner)
			currentStreak++;
		else
			break;
	}

	let tempStreak = 0;
	for (let i = 0; i < history.length; i++) {
		if (history[i].meWinner) {
			tempStreak++;
			if (tempStreak > bestStreak)
				bestStreak = tempStreak;
		}
		else
			tempStreak = 0;
	}

	return { currentStreak, bestStreak };
}

function fillBoxPlayer(totalGames: number, wins: number) {
	const total = document.getElementById('total-games');
	if (total)
		total.textContent = totalGames.toString();

	const winRate = Math.round((wins / totalGames) * 100);
	const rate = document.getElementById('win-rate');
	if (rate) {
		if (totalGames > 0) {
			rate.textContent = `${winRate}%`;
			if (winRate >= 50)
				rate.classList.add('text-green-400');
			else
				rate.classList.add('text-red-400');
		}
		else
			rate.textContent = '-';
	}
	const winRateBar = document.getElementById('win-rate-bar') as HTMLDivElement;
	if (winRateBar) {
		winRateBar.style.height = `${winRate}%`;
		if (winRate >= 50)
			winRateBar.classList.add('bg-green-500');
		else
			winRateBar.classList.add('bg-red-400');
	}
}

export function fillBoxStats(totalGames: number, wins: number, history: any) {
	const totalWins = document.getElementById('total-wins');
	if (totalWins)
		totalWins.textContent = wins.toString();
	const losses = totalGames - wins;
	const totalLoss = document.getElementById('total-loss');
	if (totalLoss)
		totalLoss.textContent = losses.toString();

	const { currentStreak, bestStreak } = computeStreaks(history);
	const currentStreakEl = document.getElementById('current-streak');
	if (currentStreakEl)
		currentStreakEl.textContent = currentStreak.toString();
	const bestStreakEl = document.getElementById('best-streak');
	if (bestStreakEl)
		bestStreakEl.textContent = bestStreak.toString();

	updateAchievements(totalGames, wins, bestStreak);
}

let currentChart: ApexCharts | null = null;

export function populateGraph(totalGames: number, evolution: any) {
	if (totalGames > 0) {
		const graphDiv = document.getElementById('stat-graph');
		if (!graphDiv)
			return;
		graphDiv.classList.remove('hidden');

		if (currentChart) {
			currentChart.destroy();
			currentChart = null;
		}

		const data = evolution;

		const options = {
			chart: { 
				type: 'line',
				width: '100%',
				height: '60%',
				toolbar: { show: false },
			},
			series: [{ name: 'ELO', data }],
			xaxis: {
				title: { text: 'Match number' },
				axisTicks: { show: false },
				axisBorder: { show: false },
				crosshairs: { show: false },
			},
			yaxis: {
				title: { text: 'ELO' },
				crosshairs: { show: false },
			},
			stroke: { 
				width: 2,
				curve: 'smooth'
			},
			markers: {
				size: 2,
				strokeWidth: 0
			},
			colors: ['var(--color-primary)'],
			grid: {
				show: true,
				borderColor: '#615f61ff',
			},
			tooltip: {
				enabled: true,
				x: { show: false }
			}
		};
		// stroke: { curve: 'straight' }
		// stroke: { curve: 'stepline' }
		// stroke: { curve: 'smooth' }

		// const chart = new ApexCharts(graphDiv, options);
		// chart.render();
		currentChart = new ApexCharts(graphDiv, options);
		currentChart.render();
	}
	else {
		const noMatches = document .getElementById('no-matches-graph');
		if (noMatches)
			noMatches.style.display = 'flex';
	}
}

// voir si Yanis prefere card tte meme fond ou green/red (rm match.meWinner bg- border-)
function renderOneMatchHistory(match: any): string {
	return /*ts*/`
		<div class="flex items-center justify-between p-3 bg-[#1a0c24]/50 rounded-lg border border-[var(--color-primary)]/20
			${match.meWinner ? 'bg-green-900/30 border-green-400/30' : 'bg-red-900/30 border-red-400/30'}">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-[#2a1a34] text-[#d4ced4] flex items-center justify-center font-bold">
					${ (match.meWinner ? match.loser_username[0] : match.winner_username[0]).toUpperCase() }
				</div>
				<div>
					<p class="text-[#d4ced4] font-medium">
						vs ${match.meWinner ? match.loser_username : match.winner_username}
					</p>
					<p class="text-xs text-[#888]">${formatDateToLocal(match.created_at)}</p>
				</div>
			</div>
			<div class="text-right">
				<p class="text-[var(--color-primary-light)] font-bold">
					${match.winner_score} - ${match.loser_score}
					${match.abandon ? `
					<span class="font-normal text-xs text-[var(--color-primary-light)] italic">abandon</span>
					` : ''}
				</p>
				<p class="text-xs ${match.meWinner ? 'text-green-400' : 'text-red-400'} uppercase font-semibold">
					${match.meWinner ? 'WIN' : 'LOSS'}
				</p>

			</div>
		</div>
	`;
}


function updateAchievements( totalGames: number, wins: number, bestStreak: number) {
	const unlock = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			el.classList.remove('opacity-30');
			el.classList.add('text-[var(--color-primary-light)]');
		}
	};

	if (wins >= 1)
		unlock('ach-first-win');

	if (bestStreak >= 5)
		unlock('ach-on-fire');

	if (totalGames >= 50)
		unlock('ach-grinder');

	if (totalGames >= 100)
		unlock('ach-top-50');
}

export async function populateProfil() {
	try {
		const response: UserResponse = await usersService.userInfo();
		if (response.success && response.user) {
			const usernameInput = document.getElementById('username-input') as HTMLInputElement;
			const userEmail = document.getElementById('user-email');
			const userAvatar = document.getElementById('user-avatar') as HTMLImageElement;

			if (usernameInput)
				usernameInput.value = response.user.username as string;
			if (userEmail)
				userEmail.textContent = response.user.email as string;
			if (userAvatar) {
				const srcPath = '/uploads/';
				const fullPath = srcPath + response.user.avatar;
				userAvatar.src = fullPath;
			}

			const loader = document.getElementById('profil-loader');
			const content = document.getElementById('profil-content');
			if (loader)
				loader.style.display = 'none';
			if (content)
				content.style.display = '';
		}
		const matches: any = await matchService.getMatchHistory();
		if (matches.success && matches.match) {
			const noMatches = document.getElementById('no-matches');
			const matchHistoryList = document.getElementById('match-history-list');
			if (matchHistoryList && noMatches) {
				const totalGames = matches.match.length;
				const wins = matches.match.filter((m: any) => m.meWinner).length;
				fillBoxPlayer(totalGames, wins);

				const graphElo: any = await matchService.getEvolution();
				if (graphElo.success && graphElo.evolution)
					populateGraph(totalGames, graphElo.evolution);

				fillBoxStats(totalGames, wins, matches.match);

				if (totalGames > 0)
					matchHistoryList.innerHTML = matches.match.map((match: any) => renderOneMatchHistory(match)).join('');
				else {
					noMatches.style.display = 'block';
					matchHistoryList.innerHTML = '';
				}
			}
		}
		setupProfilListeners();
	}
	catch (error) {
		catchHttpError('User error:', error);
	}
}
