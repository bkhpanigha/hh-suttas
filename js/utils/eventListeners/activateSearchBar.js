import { performStandardSearch } from "../userActions/performStandardSearch.js";
import getDocumentAreas from "../getDocumentAreas.js";

export default function activateSearchBar() {
	const {searchForm, searchButton} = getDocumentAreas();
	
	// form's onsubmit
	if (searchForm) {
		searchForm.onsubmit = (event) => {
			event.preventDefault(); // Empêcher le comportement par défaut du formulaire
			performStandardSearch();
		};
	}

	// Button's onclick
	if (searchButton) {
		searchButton.onclick = () => {
			performStandardSearch();
		};
	}
}
