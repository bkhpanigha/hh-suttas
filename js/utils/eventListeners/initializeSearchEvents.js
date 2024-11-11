import { startSearch } from '../userActions/startSearch.js';
import { searchState } from '../userActions/searchState.js';

export function initializeSearchEvents() {
    // Add button for mobile
    const mobileButton = document.createElement('button');
    mobileButton.className = 'mobile-menu-button';
    mobileButton.textContent = 'Search Panel';
    document.body.insertBefore(mobileButton, document.body.firstChild);
    
    const optionPanel = document.getElementById('optionPanel');
    const searchButton = document.getElementById('searchButton');
    
    // Function to close menu
    const closeMenu = () => {
        if (window.innerWidth <= 768) {
            optionPanel.classList.remove('open');
            mobileButton.classList.remove('open');
        }
    };
    
    // Handle menu open/close
    mobileButton.addEventListener('click', () => {
        optionPanel.classList.toggle('open');
        mobileButton.classList.toggle('open');
    });
    
    // Close the menu when the search button is clicked
    searchButton.addEventListener('click', () => {
        if (searchState.isSearching) {
            searchState.shouldStopSearch = true;
        } else {
            startSearch();
        }
        closeMenu();
    });
    
    // Handle window resizing
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            optionPanel.classList.remove('open');
            mobileButton.classList.remove('open');
        }
    });

    const searchInput = document.getElementById('searchInput');

    window.addEventListener("load", function() {
        const searchInput = document.getElementById("searchInput");
        const searchButton = document.getElementById("searchButton");
        const langInputs = Array.from(document.querySelectorAll('input[name="lang"]'));
        const categoryInputs = Array.from(document.querySelectorAll('input[name="book"]'));

        function checkInputs() {
            const searchValue = searchInput.value.trim();
            const isSearchInputValid = searchValue.length >= 3; // At least 3 characters
            const isLangChecked = langInputs.some(input => input.checked);
            const isCategoryChecked = categoryInputs.some(input => input.checked);
            
            searchButton.disabled = !(isSearchInputValid && isLangChecked && isCategoryChecked);
        }

        [...langInputs, ...categoryInputs].forEach(input => {
            input.addEventListener("change", checkInputs);
        });

        searchInput.addEventListener("input", checkInputs);
        checkInputs();

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                if (!searchButton.disabled) {
                    startSearch();
                    closeMenu();
                }
                event.preventDefault();
            }
        });
    });

    window.onload = () => searchInput.focus();
}
