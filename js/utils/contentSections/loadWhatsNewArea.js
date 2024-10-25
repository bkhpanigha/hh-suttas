import getDocumentAreas from "../getDocumentAreas.js";

export function loadWhatsNewArea(availableSuttasJson) 
{
    const {whatsNewArea} = getDocumentAreas();

    function daysAgo(dateString) {
      const dateAdded = new Date(dateString);
      const currentDate = new Date();
      const timeDiff = Math.abs(currentDate - dateAdded);
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert time difference to days
      return daysDiff === 0 ? 'Today' : `${daysDiff} days ago`;
    }
  
    // Sort the suttas by date_added in descending order
    const sortedSuttas = Object.values(availableSuttasJson).sort((a, b) => new Date(b.date_added) - new Date(a.date_added));
    const recentSuttas = sortedSuttas.slice(0, 5);
  
    if (whatsNewArea) {
      whatsNewArea.innerHTML = `<h2>What's New</h2>` + 
      `<div class="whats-new-container">
          ${recentSuttas.map(sutta => {
            const id = sutta.id.replace(/\s+/g, '');
            const title = sutta.title;
            const daysAgoAdded = daysAgo(sutta.date_added); // Calculate how many days ago it was added
            const link = `<a href="/?q=${id.toLowerCase()}">${title}</a>`;
            return `
              <div class="sutta-box">
                <h3 class="sutta-card-title">${link}</h3>
                <div class="sutta-pali-title"><em>${id}: ${sutta.pali_title}</em></div>
                <div class="sutta-date-added"><small>Added: ${daysAgoAdded}</small></div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }