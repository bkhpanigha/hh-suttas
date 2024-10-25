import { displaySuttas } from "../contentSections/displaySuttas.js";
import getDocumentAreas from "../getDocumentAreas.js";
import { getSuttasByIds } from "../getSuttasByIds.js";
import { removeDiacritics } from "../misc/removeDiacritics.js";
import db from "../../dexie/dexie.js";


export default function activateSearchBar(availableSuttasJson)
{
    const {searchBar, suttaArea} = getDocumentAreas();

    searchBar.focus();
    searchBar.addEventListener("input", async (e) => 
    {
        const searchQuery = e.target.value.trim().toLowerCase();
        if (!searchQuery) 
        {
            suttaArea.innerHTML = "";
            displaySuttas(availableSuttasJson);
            return;
        }

        const collection = db.suttas.filter((sutta) => {
            const suttaContent = JSON.stringify(sutta.value).toLowerCase();
            if (suttaContent.includes(searchQuery)) return true;

            const suttaContentWithoutDiacritics = removeDiacritics(suttaContent);
            return suttaContentWithoutDiacritics.includes(searchQuery);
        });

        const searchResults = await collection.toArray();
        const suttaIds = searchResults.map((result) => result.id)
        const suttas = getSuttasByIds(suttaIds, availableSuttasJson);

        if (suttaIds.length > 0) 
        {
            suttaArea.innerHTML = "";
            displaySuttas(suttas, true);
        }
        else 
        {
            suttaArea.innerHTML = "<h2 class=\"no-results\">No results found</h2>";
        }
    });

}