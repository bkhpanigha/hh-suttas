import DateHelper from "../DateHelper.js";
import getDocumentAreas from "../getDocumentAreas.js";

export const books = {
  "dn": "Dīgha Nikāya",
  "mn": "Majjhima Nikāya",
  "sn": "Saṃyutta Nikāya",
  "an": "Aṅguttara Nikāya",
  "kn": "Khuddaka Nikāya"
};

function createSuttaCard(sutta) {
  const id = sutta.id;
  const title = sutta.title;
  const pali_title = sutta.pali_title;
  const heading = sutta.heading ? `<div class="sutta-card-heading">${sutta.heading}</div>` : '';
  const description = sutta.description
    ? `<hr class="sutta-card-divider"/><div class="sutta-card-description">${sutta.description}</div>`
    : '';

  return `
    <li class="sutta-card">
      <a href="/?q=${id.toLowerCase().replace(/\s+/g, '')}">
        <div class="sutta-card-content">
          <div class="sutta-card-top">
            <div class="sutta-title">${id} — ${title}</div>
            ${heading}
          </div>
          <div class="sutta-card-bottom">
            <div class="sutta-pali-title">${pali_title}</div>
          </div>
          ${description}
        </div>
      </a>
    </li>`;
}

export function displaySuttasLibrary(suttas, isFiltering = false) {
  const { suttaArea, whatsNewArea } = getDocumentAreas();
  suttaArea.innerHTML = "";
  whatsNewArea.style.display = isFiltering ? "none" : "block";

  let currentGroup = -1;

  const content = Object.entries(suttas).map(([sutta_id, sutta]) => {
    const card = createSuttaCard(sutta);

    if (!isFiltering) {
      const nikaya = sutta_id.slice(0, 2).toLowerCase();
      const key = Object.keys(books)[currentGroup];

      if (nikaya !== key && currentGroup < 4) {
        currentGroup++;
        const groupKey = Object.keys(books)[currentGroup];
        return `<h2>${books[groupKey]}</h2>${card}`;
      }
    }

    return card;
  }).join('');

  suttaArea.innerHTML = `<ul>${content}</ul>`;
}

export function displaySuttasHistory(suttas) {
  const { suttaArea, whatsNewArea } = getDocumentAreas();
  suttaArea.innerHTML = "";
  whatsNewArea.style.display = "none";

  const sorted = Object.entries(suttas)
    .sort((a, b) => new Date(b[1].date_added) - new Date(a[1].date_added));

  let lastGroup = null;
  let html = "<ul>";

  sorted.forEach(([_, sutta]) => {
    const daysAgo = DateHelper.getDaysAgo(sutta.date_added);

    if (lastGroup !== daysAgo) {
      html += `<li class="sutta-group-label">Added ${daysAgo}:</li>`;
      lastGroup = daysAgo;
    }

    html += createSuttaCard(sutta);
  });

  html += "</ul>";
  suttaArea.innerHTML = html;
}
