
export function showNotification(message: string, type: 'success' | 'error'): void {
	const notification = document.createElement('div');
	notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 transition-all duration-300 ${
		type === 'success' ? 'bg-green-600' : 'bg-red-600'
	}`;
	notification.textContent = message;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.remove();
	}, 3000);
}
