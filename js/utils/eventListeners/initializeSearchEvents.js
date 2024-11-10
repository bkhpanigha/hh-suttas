import { startSearch } from '../userActions/startSearch.js';
import { searchState } from '../userActions/searchState.js';

export function initializeSearchEvents() {
    document.querySelector('#searchButton').addEventListener('click', () => {
        if (searchState.isSearching) {
            searchState.shouldStopSearch = true;
        } else {
            startSearch();
        }
    });

    const searchInput = document.getElementById('searchInput');

    window.addEventListener("load", function() {
        const searchInput = document.getElementById("searchInput");
        const searchButton = document.getElementById("searchButton");
        const langInputs = Array.from(document.querySelectorAll('input[name="lang"]'));
        const categoryInputs = Array.from(document.querySelectorAll('input[name="book"]'));

        function checkInputs() {
            const isSearchInputNotEmpty = searchInput.value.trim() !== '';
            const isLangChecked = langInputs.some(input => input.checked);
            const isCategoryChecked = categoryInputs.some(input => input.checked);
            searchButton.disabled = !(isSearchInputNotEmpty && isLangChecked && isCategoryChecked);
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
                }
                event.preventDefault();
            }
        });
    });

    window.onload = () => searchInput.focus();
}