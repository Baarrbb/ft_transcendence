

export function formatDateToLocal(dateDB: string): string {
	const date = new Date(dateDB.replace(' ', 'T') + 'Z');
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
