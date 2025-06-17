import DateHelper from "../DateHelper.js";
import getDocumentAreas from "../getDocumentAreas.js";

const MAX_WHATS_NEW_ITEMS = 5;
const NEW_STATUS_DURATION_IN_DAYS = 30;

function createSuttaCardHTML(sutta) {
  const { id, title, pali_title, date_added } = sutta;
  const daysAgo = DateHelper.getDaysAgo(date_added);
  const queryId = id.toLowerCase().replace(/\s+/g, "");

  return `
        <a class="sutta-box" href="/?q=${queryId}">
            <h3 class="sutta-card-title">${title}</h3>
            <div class="sutta-pali-title">${id} — ${pali_title}</div>
            <div class="sutta-date-added"><small>Added ${daysAgo}</small></div>
        </a>
    `;
}

export default function loadWhatsNewArea(availableSuttasJson) {
  const { whatsNewArea } = getDocumentAreas();

  if (!whatsNewArea) return;

  const recentSuttas = Object.values(availableSuttasJson)
    .filter((sutta) => DateHelper.getDaysDifference(sutta.date_added) <= NEW_STATUS_DURATION_IN_DAYS)
    .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
    .slice(0, MAX_WHATS_NEW_ITEMS);

  if (recentSuttas.length === 0) return;

  const cardsHTML = recentSuttas.map(createSuttaCardHTML).join("");

  whatsNewArea.innerHTML = `
        <h2>What's New</h2>
        <div class="whats-new-container">
            ${cardsHTML}
        </div>
    `;
}
