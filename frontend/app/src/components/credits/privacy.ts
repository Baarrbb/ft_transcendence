

export function renderPrivacy() {
	return /*ts*/`
		<div class="backdrop-blur-sm bg-[#02010f]/50 h-full w-full flex flex-col from-[#0c0511] to-[#1a0c24] text-[#d4ced4] overflow-auto custom-scrollbar">

			<div class="text-center py-6 px-4 flex-shrink-0">
				<div class="text-4xl font-bold text-center mb-4 flex-shrink-0">
					<h2 class="font-display text-shadow-[2px_2px_#60087af6] uppercase text-[var(--color-primary)] pt-6">
						Privacy & Data
					</h2>
				</div>

				<button 
					class="mt-2 px-4 py-2 bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] rounded text-[#02010f] font-bold transition-colors"
					onclick="window.history.back()">
					← Back
				</button>
			</div>

			<div class="flex-1 px-4 pb-8 max-w-4xl mx-auto space-y-6 text-[#d4ced4]">
				
				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Types of Data We Collect</h3>
					<p class="text-sm md:text-base">
						We collect information that you provide directly, such as your username, email, and avatar. We also collect data generated from your interactions in Planet Pong, including game history, scores, and chat messages.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Purpose of Data Collection</h3>
					<p class="text-sm md:text-base">
						Your data is used to provide, maintain, and improve our gaming services. This includes managing accounts, tracking scores, showing leaderboards, and facilitating social interactions like friends and chat.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Data Retention</h3>
					<p class="text-sm md:text-base">
						We retain your data as long as your account is active. If you choose to anonymize or delete your account, your personal information will be removed or anonymized according to your selection, while certain game statistics may remain in an aggregated, non-identifiable form.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Your Rights</h3>
					<ul class="list-disc list-inside text-sm md:text-base space-y-1">
						<li>Access your data: download a copy of all information we store about you.</li>
						<li>Request anonymization: remove personal identifiers while retaining non-identifiable data.</li>
						<li>Request deletion: permanently delete your account and all associated data.</li>
					</ul>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">How to Exercise Your Rights</h3>
					<p class="text-sm md:text-base">
						All options to download, anonymize, or delete your data are available in your account settings.
					</p>
				</section>

			</div>
		</div>
	`
}


