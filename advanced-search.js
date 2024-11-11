import { initializeSearchEvents } from './js/utils/eventListeners/initializeSearchEvents.js';
import { searchSuttasWithStop } from './js/utils/contentSections/searchSuttasWithStop.js';
import { startSearch } from './js/utils/userActions/startSearch.js';
import { searchState } from './js/utils/userActions/searchState.js';
import { preventFlashing } from './js/utils/navigation/preventFlashing.js';

// Make main functions globally available
// This is necessary as they are referenced in the HTML
window.startSearch = startSearch;
window.searchSuttasWithStop = searchSuttasWithStop;
window.searchState = searchState;

// Initialize search events once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	try {
		initializeSearchEvents();
		
		// Add button for mobile
		const mobileButton = document.createElement('button');
		mobileButton.className = 'mobile-menu-button';
		mobileButton.textContent = 'Search Options';
		document.body.insertBefore(mobileButton, document.body.firstChild);
		
		const optionPanel = document.getElementById('optionPanel');
		const searchButton = document.getElementById('searchButton');
		
		// Handle menu open/close
		mobileButton.addEventListener('click', () => {
			optionPanel.classList.toggle('open');
			mobileButton.classList.toggle('open');
		});
		
		// Close the menu when the search button is clicked
		searchButton.addEventListener('click', () => {
			if (window.innerWidth <= 768) {
				optionPanel.classList.remove('open');
				mobileButton.classList.remove('open');
			}
		});
		
		// Handle window resizing
		window.addEventListener('resize', () => {
			if (window.innerWidth > 768) {
				optionPanel.classList.remove('open');
				mobileButton.classList.remove('open');
			}
		});
	} catch (error) {
      		console.error('[ERROR] Something went wrong:', error);
  	}
  	finally
  	{
		preventFlashing();
  	}
});
