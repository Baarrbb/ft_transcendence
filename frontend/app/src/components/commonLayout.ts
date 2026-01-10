
function renderTitle(text: string): string {
	return /*ts*/`
		<div class="flex-shrink-0 p-6 bg-[var(--color-primary)]/10 border-b border-[var(--color-primary)]/30 rounded-2xl">
			<h3 class="text-xl font-display uppercase tracking-wide text-[var(--color-primary-light)] text-center font-bold relative">
				<span class="relative z-10 backdrop-blur-sm px-2">
					${text}
				</span>
				<div class="absolute inset-0  flex items-center">
					<div class="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</div>
			</h3>
		</div>
	`;
}

function renderCard(title: string, id: string, contentType: 'list' | 'search' = 'list'): string {

	const content = contentType === 'search' ? 
	/*ts*/`
		<div class="flex-1 p-6 min-h-0 flex flex-col gap-4">
			<div class="relative">
				<input 
					type="text" 
					placeholder="Search friends..." 
					class="w-full pl-5 pr-4 py-3 bg-[var(--color-primary-bg)] border border-[var(--color-primary)] rounded-lg text-[#d4ced4] placeholder-[#888] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
					id="${id}-search"
				>
			</div>
			<ol class="flex-1 overflow-auto custom-scrollbar space-y-2" id="${id}">
			</ol>
		</div>
	` : 
	/*ts*/`
		<div class="flex-1 p-6 min-h-0">
			<ol class="h-full overflow-auto custom-scrollbar space-y-2" id="${id}">
			</ol>
		</div>
	`;

	return /*ts*/`
		<div class="flex flex-col text-[#d4ced4] lg:h-[80vh] h-[42vh] lg:w-[40vw] w-[70vw] bg-[#02010f]/80 backdrop-blur-sm border border-[var(--color-primary)] rounded-2xl shadow-xl">
			${renderTitle(title)}
			${content}
		</div>
	`;
}

export function renderView(viewTitle: string, firstTitle: string, secondTitle: string, firstId: string, secondId: string, cardTypes: ['list' | 'search', 'list' | 'search'] = ['list', 'list']): string {
	return /*ts*/`
		<div class="flex flex-col h-full w-full p-4">

			<div class="text-center mb-6 flex-shrink-0">
				<h2 class="text-4xl font-display uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 relative">
					<span class="relative z-10">${viewTitle}</span>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
				</h2>
			</div>

			<div class="flex flex-col lg:flex-row gap-2 w-full flex-1 justify-center items-center lg:items-center max-w-7xl mx-auto">
				${renderCard(firstTitle, firstId, cardTypes[0])}
				${renderCard(secondTitle, secondId, cardTypes[1])}
			</div>
		</div>
	`;
}

export function setupSearch(searchInputId: string, listId: string, getItems: () => any[], renderFunction: (item: any) => string): void {
	const searchInput = document.getElementById(searchInputId) as HTMLInputElement;
	const listElement = document.getElementById(listId);

	if (searchInput && listElement) {
		searchInput.addEventListener('input', (e) => {
			const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();

			// const filteredData = allData.filter(item => 
			// 	item.username.toLowerCase().includes(searchTerm)
			// );
			const items = getItems().filter(item => 
				item.username.toLowerCase().includes(searchTerm)
			);

			// listElement.innerHTML = filteredData.map(renderFunction).join('');
			listElement.innerHTML = items.map(renderFunction).join('');
		});
	}
}

export function populateList(elementId: string, data: any[], renderFunction: (item: any, i: number) => string): void {
	const element = document.getElementById(elementId);
	if (element)
		element.innerHTML = data.map((item, i) => renderFunction(item, i)).join('');
}


export function createTitle(text: string): HTMLElement {
	const title = document.createElement('h2');
	title.innerText = text;
	title.id = 'title-overlay';
	title.classList.add( 'text-2xl', 'font-bold', 'text-white', 'text-center', 'font-display', 'mb-2');
	return title;
}

export function createOverlay(id: string): HTMLElement | null {
	const main = document.getElementById('main-content') as HTMLElement;
	if (!main)
		return null;

	const overlayContainer = document.createElement('div');
	overlayContainer.id = id;
	overlayContainer.className = 'absolute inset-0 flex items-center justify-center w-full h-full';

	overlayContainer.addEventListener('click', () => {
		overlayContainer.remove();
	})

	const overlay = document.createElement('div');
	overlay.className = `w-[90vw] sm:w-[420px] min-h-[220px] flex flex-col items-center justify-center gap-4 p-6 border border-[var(--color-primary)]/50
		rounded-2xl bg-gradient-to-b from-black/80 via-[#0a0a1f]/90 to-black/80 backdrop-blur z-20 transition-all`;

	overlay.addEventListener('click', (e) => {
		e.stopPropagation();
	});

	overlayContainer.appendChild(overlay);
	main.appendChild(overlayContainer);

	return overlay;
}