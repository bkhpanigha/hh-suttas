import { searchSuttasWithStop } from './js/utils/contentSections/searchSuttasWithStop.js';
import { startSearch } from './js/utils/userActions/startSearch.js';
import { searchState } from './js/utils/userActions/searchState.js';
import { preventFlashing } from './js/utils/navigation/preventFlashing.js';

// Make main functions globally available
// This is necessary as they are referenced in the HTML
window.startSearch = startSearch;
window.searchSuttasWithStop = searchSuttasWithStop;
window.searchState = searchState;
