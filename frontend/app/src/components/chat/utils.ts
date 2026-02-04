

export function highlightFriend(username: string | null) {
	const friendsList = document.getElementById('chat-friends-list');
	if (!friendsList)
		return;

	friendsList.querySelectorAll('.friend-chat.selected').forEach(el => {
		el.classList.remove('selected');
		el.classList.remove('bg-[var(--color-primary-bg)]');
	});

	const selected = friendsList.querySelector(`[data-username="${username}"]`);
	if (selected) {
		selected.classList.add('selected');
		selected.classList.add('bg-[var(--color-primary-bg)]');
	}
}

export function formatDateToLocal(dateDB: string | number): string {
	let date: Date;
	if (typeof dateDB === 'number')
		date = new Date(dateDB);
	else {
		// date = new Date(dateDB.replace(' ', 'T') + 'Z');
		const iso = dateDB.includes('T') ? dateDB : dateDB.replace(' ', 'T') + 'Z';
		date = new Date(iso);
	}
	const options: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	};
	return date.toLocaleString('fr-FR', options).replace(',', '');
}
