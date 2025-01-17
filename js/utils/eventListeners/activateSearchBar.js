import { displaySuttas } from "../contentSections/displaySuttas.js";
import getDocumentAreas from "../getDocumentAreas.js";
import { getSuttasByIds } from "../getSuttasByIds.js";
import { removeDiacritics } from "../misc/removeDiacritics.js";
import db from "../../dexie/dexie.js";

export default function activateSearchBar(availableSuttasJson) {
    const {searchBar, suttaArea} = getDocumentAreas();
    searchBar.focus();

    searchBar.addEventListener("input", async (e) => {
        const searchQuery = e.target.value.trim().toLowerCase();
        
        if (!searchQuery) {
            suttaArea.innerHTML = "";
            displaySuttas(availableSuttasJson);
            return;
        }

        // Search in both English and Polish collections
        const searchInCollection = async (collection) => {
            return await collection.filter((sutta) => {
                const suttaContent = JSON.stringify(sutta).toLowerCase();
                if (suttaContent.includes(searchQuery)) return true;
                const suttaContentWithoutDiacritics = removeDiacritics(suttaContent);
                return suttaContentWithoutDiacritics.includes(searchQuery);
            }).toArray();
        };

        // Perform searches in parallel
        const [englishResults, polishResults] = await Promise.all([
            searchInCollection(db.suttas_en),
            searchInCollection(db.suttas_pl)
        ]);

        // Combine results and remove duplicates
        const allResults = [...englishResults, ...polishResults];
        const uniqueSuttaIds = [...new Set(allResults.map(result => result.id))];
        
        const suttas = getSuttasByIds(uniqueSuttaIds, availableSuttasJson);

        if (uniqueSuttaIds.length > 0) {
            suttaArea.innerHTML = "";
            displaySuttas(suttas, true);
        } else {
            suttaArea.innerHTML = "<h2 class=\"no-results\">No results found</h2>";
        }
    });
}