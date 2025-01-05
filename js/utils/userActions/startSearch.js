import { searchState } from './searchState.js';
import { searchSuttasWithStop } from '../contentSections/searchSuttasWithStop.js';
import { getConfiguration } from '../misc/getConfiguration.js';

export async function startSearch() {
    if (searchState.isSearching) return;
    searchState.isSearching = true;
    searchState.shouldStopSearch = false;
	
	window.scrollTo(0, 0);

    const searchButton = document.querySelector('#searchButton');
    searchButton.textContent = "Stop";
    searchButton.classList.add("red");

    const query = document.querySelector('#searchInput').value;
    const options = getConfiguration();

    await searchSuttasWithStop(query, options);

    searchButton.textContent = "Search";
    searchButton.classList.remove("red");
    searchState.isSearching = false;
}