import getDocumentAreas from "../getDocumentAreas.js";

export function loadWhatsNewArea(availableSuttasJson) {
    const { whatsNewArea } = getDocumentAreas();

    function daysAgo(dateString) {
        const dateAdded = new Date(dateString);
        const currentDate = new Date();
        const timeDiff = Math.abs(currentDate - dateAdded);
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert the difference into days
        if (daysDiff === 0) {
            return 'Today';
        } else if (daysDiff === 1) {
            return '1 day ago';
        } else {
            return `${daysDiff} days ago`;
        }
    }

    function isWithin90Days(dateString) {
        const dateAdded = new Date(dateString);
        const currentDate = new Date();
        const timeDiff = currentDate - dateAdded;
        return timeDiff <= 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    }

    // Sort suttas by date_added in descending order and filter those older than 90 days
    const sortedSuttas = Object.values(availableSuttasJson)
        .filter(sutta => isWithin90Days(sutta.date_added))
        .sort((a, b) => new Date(b.date_added) - new Date(a.date_added));

    const recentSuttas = sortedSuttas.slice(0, 5);

    if (whatsNewArea && recentSuttas.length > 0) {
        whatsNewArea.innerHTML = `<h2>What's New</h2>` +
            `<div class="whats-new-container">
                ${recentSuttas.map(sutta => {
                    const id = sutta.id;
                    const title = sutta.title;
                    const daysAgoAdded = daysAgo(sutta.date_added); // Calculer combien de jours depuis l'ajout
                    return `
                        <a class="sutta-box" href="/?q=${id.toLowerCase().replace(/\s+/g, '')}">
                            <h3 class="sutta-card-title">${title}</h3>
                            <div class="sutta-pali-title">${id} — ${sutta.pali_title}</div>
                            <div class="sutta-date-added"><small>Added ${daysAgoAdded}</small></div>
                        </a>
                    `;
                }).join('')}
            </div>`;
    }
}
