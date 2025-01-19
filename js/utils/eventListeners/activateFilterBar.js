import getDocumentAreas from "../getDocumentAreas.js";
import { filterSuttas } from "../userActions/filterSuttas.js";
import { displaySuttas } from "../contentSections/displaySuttas.js";

export default function activateFilterBar(availableSuttasJson) {
  const { filterBar, suttaArea } = getDocumentAreas();

  filterBar.addEventListener("input", async (e) => {
    const filterQuery = e.target.value.trim().toLowerCase();
    suttaArea.innerHTML = "";

    if (filterQuery) {
      const filterResults = filterSuttas(filterQuery);
      if (Object.keys(filterResults).length > 0) {
        displaySuttas(filterResults, true);
      } else {
        suttaArea.innerHTML += "<h2 class=\"no-results\">No results found</h2>";
      }
    } else {
      displaySuttas(availableSuttasJson);
    }
  });
}
