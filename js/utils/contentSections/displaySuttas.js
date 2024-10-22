import getDocumentAreas from "../getDocumentAreas.js";

export const books =
{
  "dn": "Dīgha Nikāya",
  "mn": "Majjhima Nikāya",
  "sn": "Saṃyutta Nikāya",
  "an": "Aṅguttara Nikāya",
  "kn": "Khuddaka Nikāya"
};

export function displaySuttas(suttas, isSearch = false) 
{
    let currentGroup = -1;

    const {suttaArea, whatsNewArea} = getDocumentAreas();
    const forewordViewed = localStorage.getItem('forewordViewed', false);
    const forewordButton = document.getElementById('foreword-button');
  
    if (forewordViewed == 'true' && forewordButton) 
    {
      forewordButton.style.display = 'none';
    }
  
    if (isSearch) 
    {
      suttaArea.innerHTML += "<h2>Search Results:</h2>";
      whatsNewArea.style.display = "none";
    } else 
    {
      whatsNewArea.style.display = "block";
    }
  
    suttaArea.innerHTML += `<ul style="margin-top: 20px;">${Object.entries(suttas).map(([sutta_id, sutta_details]) => {
      const id = sutta_details['id'].replace(/\s+/g, '');;
      const title = sutta_details['title']
      const heading = sutta_details['heading'] || ""
      const link = `<a href="/?q=${id.toLowerCase()}">${id}: ${title}`;
      const em = heading ? `<span style="color: #7f6e0a;"><em>${heading}</em></span>` : '';
      const nikaya = sutta_id.slice(0, 2).toLowerCase();
  
      // Check if the current sutta belongs to a new group
      const key = Object.keys(books)[currentGroup];
  
      if (!isSearch && nikaya !== key && currentGroup < 4) {
        // If it's a new group, display the subheading
        currentGroup += 1;
        const key = Object.keys(books)[currentGroup];
  
        return `<h2>${books[key]}</h2><li>${link}${em ? ` (${em})` : ''}</a></li>`;
      } else {
        return `<li>${link}${em ? ` (${em})` : ''}</a></li>`;
      }
    }).join('')}</ul>`;
}

