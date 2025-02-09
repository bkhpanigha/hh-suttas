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
  
    if (isSearch) 
    {
      suttaArea.innerHTML += "<h2 class=\"search-results\">Search Results:</h2>";
      whatsNewArea.style.display = "none";
    } else 
    {
      whatsNewArea.style.display = "block";
    }
  
    suttaArea.innerHTML += `<ul>${Object.entries(suttas).map(([sutta_id, sutta_details]) => {
		const id = sutta_details['id'];
		const title = sutta_details['title'];
		const pali_title = sutta_details['pali_title'];
		const hasDescription = sutta_details['description'];
		const hasHeading = sutta_details['heading'];

		const description = hasDescription 
			? `<hr class="sutta-card-divider"/>
				<div class="sutta-card-description">
					${sutta_details['description']}
				</div>`
			: '';
			
		const heading = hasHeading 
			? `<div class="sutta-card-heading">
					${sutta_details['heading']}
				</div>`
			: '';

		const card = `<li class="sutta-card">
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

		const nikaya = sutta_id.slice(0, 2).toLowerCase();

		// Check if the current sutta belongs to a new group
		const key = Object.keys(books)[currentGroup];

		if (!isSearch && nikaya !== key && currentGroup < 4) {
			// If it's a new group, display the subheading
			currentGroup += 1;
			const key = Object.keys(books)[currentGroup];

			return `<h2>${books[key]}</h2>${card}`;
		} else {
			return `${card}`;
		}
	}).join('')}</ul>`;

}
