import { initializeSearchEvents } from './js/utils/eventListeners/initializeSearchEvents.js';
import { searchSuttasWithStop } from './js/utils/contentSections/searchSuttasWithStop.js';
import { startSearch } from './js/utils/userActions/startSearch.js';
import { searchState } from './js/utils/userActions/searchState.js';
import { preventFlashing } from './js/utils/navigation/preventFlashing.js';

// Functions to extract GET parameters from URL
function getQueryParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Initialize search with `search` GET parameter
function initializeSearchFromURL() {
    const searchTerm = getQueryParameter('search');
    if (searchTerm) {
        const searchInput = document.getElementById('searchInput');
        searchInput.value = decodeURIComponent(searchTerm);
        startSearch();
    }
}

// Make main functions globally available
// This is necessary as they are referenced in the HTML
window.startSearch = startSearch;
window.searchSuttasWithStop = searchSuttasWithStop;
window.searchState = searchState;

// Initialize search events once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeSearchEvents();
        initializeSearchFromURL(); //Start search if `search` GET parameter exists
    } catch (error) {
        console.error('[ERROR] Something went wrong:', error);
    } finally {
        preventFlashing();
    }
});
