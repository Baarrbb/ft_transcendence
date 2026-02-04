

export function renderTerms() {
	return /*ts*/`
		<div class="backdrop-blur-sm bg-[#02010f]/50 h-full w-full flex flex-col from-[#0c0511] to-[#1a0c24] text-[#d4ced4] overflow-auto custom-scrollbar">

			<div class="text-center py-6 px-4 flex-shrink-0">
				<div class="text-4xl font-bold text-center mb-4 flex-shrink-0">
					<h2 class="font-display text-shadow-[2px_2px_#60087af6] uppercase text-[var(--color-primary)] pt-6">
						Terms & Services
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
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Introduction</h3>
					<p class="text-sm md:text-base">
						Welcome to the Pong web application developed as part of the ft_transcendence project (the "Service"). This Service is provided for educational and demonstration purposes only.<br>
						By accessing or using the Service, you agree to be bound by these Terms & Services ("Terms"). If you do not agree with any part of these Terms, you must not use the Service.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Description of the Service</h3>
					<p class="text-sm md:text-base">
						The Service is an online multiplayer Pong platform that includes, but is not limited to:
							<ul class="list-disc list-inside text-sm md:text-base space-y-1">
								<li>
									User accounts with authentication
								</li>
								<li>
									Online Pong matches (real-time gameplay)
								</li>
								<li>
									Local Pong matches (1v1, BOT and tournaments between 4 and 8 players)
								</li>
								<li>
									Live chat
								</li>
								<li>
									User profiles, avatars, and game statistics
								</li>
							</ul>
						The Service may evolve during development, and features may be modified, added, or removed without prior notice.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Educational Project Disclaimer</h3>
					<p class="text-sm md:text-base">
						This Service is developed as part of a student project within the 42 school curriculum. It is not intended for commercial use.<br>
						No guarantees are made regarding service availability, data persistence, or long-term support.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Eligibility</h3>
					<p class="text-sm md:text-base">
						You must be legally capable of using an online service under applicable law. By using the Service, you confirm that you meet this requirement.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">User Accounts</h3>
					<p class="text-sm md:text-base">
						To access certain features, you must create an account. By creating an account, you agree to:
						<ul class="list-disc list-inside text-sm md:text-base space-y-1">
							<li>Provide accurate and up-to-date information</li>
							<li>Keep your login credentials confidential</li>
							<li>Be responsible for all activities performed through your account</li>
						</ul>
						The Service reserves the right to suspend or delete accounts in case of abuse, misuse, or violation of these Terms.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Acceptable Use</h3>
					<p class="text-sm md:text-base">
						You agree not to:
						<ul class="list-disc list-inside text-sm md:text-base space-y-1">
							<li>Use the Service for illegal or malicious purposes</li>
							<li>Harass, abuse, threaten, or harm other users</li>
							<li>Attempt to gain unauthorized access to the Service or its systems</li>
							<li>Disrupt or interfere with the security or performance of the Service</li>
						</ul>
						Any misuse of the Service may result in immediate suspension or termination of your access.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">User Content and Conduct</h3>
					<p class="text-sm md:text-base">
						Users may submit content such as usernames, avatars, chat messages, and in-game actions.<br>
						You remain responsible for the content you submit. By using the Service, you grant the Service a non-exclusive, royalty-free license to display and process this content solely for the operation of the platform.<br>
						The Service reserves the right to remove any content deemed inappropriate or in violation of these Terms.<br>
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Game Data and Statistics</h3>
					<p class="text-sm md:text-base">
						The Service may store game-related data, including match history, scores, wins, losses, and rankings.<br>
						This data is provided for informational and gameplay purposes only and may be reset or removed at any time.<br>
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Authentication and Security</h3>
					<p class="text-sm md:text-base">
						The Service may include security features such as OAuth authentication and Two-Factor Authentication (2FA).<br>
						Users are responsible for securing their own credentials.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Intellectual Property</h3>
					<p class="text-sm md:text-base">
						All elements of the Service, including the source code, design, graphics, and game logic (excluding user-generated content), are the property of the project contributors and are protected by applicable intellectual property laws.<br>
						You may not copy, redistribute, or reuse any part of the Service outside the scope of the ft_transcendence project without permission.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Availability and Maintenance</h3>
					<p class="text-sm md:text-base">
						The Service is provided on an "as is" and "as available" basis. Access may be interrupted due to maintenance, updates, or technical issues.<br>
						No uptime or availability guarantees are provided.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Limitation of Liability</h3>
					<p class="text-sm md:text-base">
						To the fullest extent permitted by law, the Service shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the Service.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Termination</h3>
					<p class="text-sm md:text-base">
						The Service reserves the right to suspend or terminate your access at any time, without notice, in case of violation of these Terms or applicable laws.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Privacy</h3>
					<p class="text-sm md:text-base">
						Your use of the Service is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal data.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Changes to the Terms</h3>
					<p class="text-sm md:text-base">
						The Service may update these Terms at any time. Continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
					</p>
				</section>

				<section>
					<h3 class="text-lg md:text-xl font-bold text-[var(--color-primary)] mb-2">Governing Law</h3>
					<p class="text-sm md:text-base">
						These Terms shall be governed by and interpreted in accordance with the laws applicable in the jurisdiction of the Service owner.
					</p>
				</section>

				<section>
					<p class="text-xs">
						Last updated: 04.02.2026
					</p>
				</section>

			</div>
		</div>
	`
}


