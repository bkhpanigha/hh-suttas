import { showNotification } from './showNotification.js';

export function performStandardSearch() {
	const searchTerm = document.getElementById('search-bar').value.trim();
	if (searchTerm) {
		const encodedTerm = encodeURIComponent(searchTerm);
		window.location.href = `/advanced-search.html?search=${encodedTerm}`;
	} else {
		showNotification('Please enter a search term.');
	}
}
