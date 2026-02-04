
export function renderCredits(): string {
	return /*ts*/`
		<div class="h-full w-full flex flex-col from-[#0c0511] to-[#1a0c24] text-[#d4ced4] overflow-auto custom-scrollbar">

			<div class="text-center py-6 px-4 flex-shrink-0">
				<div class="text-4xl font-bold text-center mb-4 flex-shrink-0">
					<h2 class="font-display text-shadow-[2px_2px_#60087af6] uppercase text-[var(--color-primary)] pt-6">
						credits
					</h2>
				</div>
				<div class="w-24 md:w-32 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent mx-auto mb-4"></div>
				<h1 class="text-xl md:text-3xl font-display uppercase tracking-[0.3em] text-[var(--color-primary)] mb-3 animate-pulse">
					ft_transcendence
				</h1>
				<h1 class="text-xl md:text-2xl font-display uppercase tracking-[0.3em] text-[var(--color-primary)] mb-3 animate-pulse">
					Planet pong
				</h1>
				<div class="w-24 md:w-32 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent mx-auto mb-4"></div>
			</div>

			<div class="flex-1 px-4 pb-8">
				<div class="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-4 max-w-4xl mx-auto">
					${renderDeveloper("Yanis", "Backend", "Y", ["TypeScript", "SQL", "Fastify"])}
					${renderDeveloper("Anisse", "UI/UX", "A", ["HTML/CSS", "Typescript"])}
					${renderDeveloper("Selim", "Game, UI/UX", "S", ["HTML/CSS", "Typescript"])}
					${renderDeveloper("Barbara", "UI/UX", "B", ["Desgin", "TypeScript", "Docker"])}
				</div>
			</div>

			<div class="backdrop-blur-sm bg-[#02010f]/50 border-t border-[var(--color-primary)] py-2 text-center flex-shrink-0">
				<p class="text-xs md:text-sm text-[#888] mb-1">Built at 42 Paris</p>
				<p class="text-xs text-[#666] mb-1">© ${new Date().getFullYear()} • Planet Pong</p>
				<div class="flex flex-row items-center justify-center">
					<p class="text-xs text-[#999]">
						<a href="/privacy" class="cursor-pointer underline hover:text-[var(--color-primary)] transition-colors mx-1">Privacy & Data</a>
					</p>
					<p class="text-xs text-[#999]">
						<a href="/terms" class="cursor-pointer underline hover:text-[var(--color-primary)] transition-colors mx-1">Terms & Services</a>
					</p>
				</div>
			</div>
		</div>
	`;
}


function renderDeveloper(name: string, role: string, icon: string, skills: string[]): string {
	return /*ts*/`
		<div class="group relative">

			<div class="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-300"></div>
			<div class="relative bg-[#02010f]/80 backdrop-blur-sm border border-[var(--color-primary)] rounded-2xl p-4 md:p-6 text-center transform group-hover:scale-[1.02] transition-all duration-300">
				<div class="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#3a0749] to-[#5a1a5a] rounded-full flex items-center justify-center text-2xl md:text-3xl mb-3 mx-auto shadow-lg">
					${icon}
				</div>
				<h2 class="text-lg md:text-xl font-display uppercase text-[var(--color-primary-light)] mb-1 tracking-wide">
					${name}
				</h2>

				<p class="text-sm md:text-base text-[var(--color-primary)] font-semibold mb-3 tracking-wide">
					${role}
				</p>

				<div class="flex flex-wrap gap-1 md:gap-2 justify-center">
					${skills.map(skill => /*ts*/`
						<span class="px-2 py-1 bg-[var(--color-primary)] text-[#0c0511] text-xs font-bold rounded-full">
							${skill}
						</span>
					`).join('')}
				</div>
				
			</div>
		</div>
	`;
}


// <!-- lien INTRA 42 -->
				// <div class="mt-3">
				// 	<div class="inline-flex items-center gap-1 text-[#888] hover:text-[var(--color-primary)] transition-colors cursor-pointer text-xs">
				// 		<span>@${name.toLowerCase()}</span>
				// 		<span>📁</span>
				// 	</div>
				// </div>