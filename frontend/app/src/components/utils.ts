

export function stringToElement(html: string): HTMLElement {
	const tmp = document.createElement('div');
	tmp.innerHTML = html;
	return tmp.firstElementChild as HTMLElement;
}

