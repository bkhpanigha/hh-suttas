import { performStandardSearch } from "../userActions/performStandardSearch.js";

export default function activateSearchBar() {
	// form's onsubmit
	const searchForm = document.querySelector("#search-form");
	if (searchForm) {
		searchForm.onsubmit = (event) => {
			event.preventDefault(); // Empêcher le comportement par défaut du formulaire
			performStandardSearch();
		};
	}

	// Button's onclick
	const searchButton = document.querySelector("#search-button");
	if (searchButton) {
		searchButton.onclick = () => {
			performStandardSearch();
		};
	}
}
