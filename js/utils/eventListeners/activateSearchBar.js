import { performStandardSearch } from "../userActions/performStandardSearch.js";
import getDocumentAreas from "../getDocumentAreas.js";

export default function activateSearchBar() {
	const {searchForm, searchButton} = getDocumentAreas();
	
	// form's onsubmit
	if (searchForm) {
		searchForm.onsubmit = (event) => {
			event.preventDefault(); // Prevents default form behavior
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
