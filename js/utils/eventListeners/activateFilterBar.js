import getDocumentAreas from "../getDocumentAreas.js";
import { filterSuttas } from "../userActions/filterSuttas.js";
import { displaySuttasLibrary, displaySuttasHistory } from "../contentSections/displaySuttas.js";

export default function activateFilterBar(availableSuttasJson) {
  const { filterBar, filterForm, suttasTabSwitcher, suttaArea } = getDocumentAreas();

  filterBar?.addEventListener("input", async (e) => {
    const filterQuery = e.target.value.trim().toLowerCase();
    suttaArea.innerHTML = "";

    if (filterQuery) {
      const filterResults = filterSuttas(filterQuery);
      if (Object.keys(filterResults).length > 0) {
        displaySuttasLibrary(filterResults, true);
      } else {
        suttaArea.innerHTML += "<h2 class=\"no-results\">No results found</h2>";
      }
    } else {
      displaySuttasLibrary(availableSuttasJson);
    }
  });

  suttasTabSwitcher?.addEventListener("change", (e) => {
    if (e.target.checked) {
      filterForm.classList.add("hide");
      filterBar.value = "";
      displaySuttasHistory(availableSuttasJson);
      return;
    }

    filterForm.classList.remove("hide");
    displaySuttasLibrary(availableSuttasJson);
  })
}
