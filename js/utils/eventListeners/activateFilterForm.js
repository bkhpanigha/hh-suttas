import getDocumentAreas from "../getDocumentAreas.js";
import { buildSutta } from "../loadContent/buildSutta.js";

export default function activateFilterForm(){
    const { filterForm, filterBar } = getDocumentAreas();

    filterForm.addEventListener("submit", e => 
    {
        e.preventDefault();
        const searchValue = searchBar.value.trim().replace(/\s/g, "");
        if (searchValue) {
            buildSutta(searchValue, availableSuttasJson);
            history.pushState({ page: searchValue }, "", `?q=${searchValue}`);
        }
    });
	
	filterForm.addEventListener('click', function () {
		filterBar.focus();
	});
}
