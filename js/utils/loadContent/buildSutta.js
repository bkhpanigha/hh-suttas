import getDocumentAreas from "../getDocumentAreas.js";
import { addNavbar } from "./addNavbar.js";
import { checkSearchUrlParam } from '../navigation/checkSearchUrlParam.js';

const getSuttaNavigation = (slug, availableSuttasJson) => {
  const suttasKeys = Object.keys(availableSuttasJson);
  const slugIndex = suttasKeys.indexOf(slug);

  const createSuttaNavigationButton = (text, index, linkStyle = "") => {
    const sutta = availableSuttasJson[suttasKeys[index]];

    if (!sutta) return "<div></div>";

    const id = sutta.id.replace(/\s+/g, '').toLowerCase();
    return `<a href="/?q=${id}" class="${linkStyle}"><span>${text}</span><span>${sutta.id}: ${sutta.title}</span></a>`
  }

  const previousSuttaButton = createSuttaNavigationButton("← Previous", slugIndex - 1);
  const nextSuttaButton = createSuttaNavigationButton("Next →", slugIndex + 1, "rightAlign");

  return `<div class="suttaNavigation">${previousSuttaButton}${nextSuttaButton}</div>`
}

export async function buildSutta(slug, availableSuttasJson) {
    const {suttaArea} = getDocumentAreas();
    const footer = document.getElementById('footer');
    const originalDisplay = footer.style.display;
    
    try {
        // Hide footer during loading
        footer.style.display = 'none';

        if (!slug) {
            return;
        }

        slug = slug.toLowerCase();
        const sutta_details = availableSuttasJson[slug];
        if (!sutta_details) {
            return;
        }

        const converter = new showdown.Converter();
        let translator = "Bhikkhu Anīgha";
        let html = window.innerWidth < 1000 ? "" : `<div class="button-area"><button id="hide-pali" class="hide-button">Toggle Pali</button></div>`;
        const sutta_title = sutta_details['title'];
        const acronym = sutta_details['id'];

        // Group all fetch promises
        const [html_text, root_text, translation_text, comment_text, authors_text] = await Promise.all([
            fetch(sutta_details['html_path']).then(response => response.json()),
            fetch(sutta_details['root_path']).then(response => response.json()),
            fetch(sutta_details['translation_path']).then(response => response.json()),
            fetch(sutta_details['comment_path'])
                .then(response => response.ok ? response.json() : {})
                .catch(() => ({})),
            fetch('authors.json').then(response => response.json())
        ]);

        // Build HTML
        const keys_order = Object.keys(html_text);
        let commentCount = 1;
        let commentsHtml = '';

        keys_order.forEach((segment) => {
            if (translation_text[segment] === undefined) translation_text[segment] = "";

            let [openHtml, closeHtml] = html_text[segment].split(/{}/);

            if (window.addBreaks === true) {
                openHtml = openHtml.replace(/^<span class='verse-line'>/, "<br><span class='verse-line'>");
            }

            // Only apply breaks inside verse lines
            if (openHtml.includes("class='verse-line'") || closeHtml.includes("class='verse-line'")) {
                openHtml = openHtml.replace(/^<span class='verse-line'>/, "<span class='verse-line'>");
                closeHtml = closeHtml.replace(/<\/span>$/, "</span><br>");
            }
          
            html +=
            `${openHtml}<span class="segment" id="${segment}">` +
            `<span class="pli-lang" lang="pi">${root_text[segment] || ''}</span>` +
            `<span class="eng-lang" lang="en">${translation_text[segment]}` +
            `${comment_text[segment] ? `<a href="${window.location.origin}?q=${slug}#comment${commentCount}" class="comment">[${commentCount}]</a>` : ''}` +
            `</span></span>${closeHtml}\n\n`;
        
            if (comment_text[segment]) {
                if(commentCount == 1) commentsHtml += '<h3>Comments</h3>';
                commentsHtml += `
                <p id="comment${commentCount}"><span>
                ${commentCount}: ${converter.makeHtml(comment_text[segment])
                    .replace(/^<p>(.*)<\/p>$/, '$1')}
                <a href="${window.location.origin}?q=${slug}#${segment}~no-highlight" style="cursor: pointer; font-size: 14px;">&larr;</a>
                </span></p>`;
                commentCount++;
            }
        });

        if (authors_text[slug]) translator = authors_text[slug];
        const translatorByline = `<div class="byline"><p>Translated by ${translator}</p></div>`;
        const suttaNavigation = getSuttaNavigation(slug, availableSuttasJson);

        // Update DOM
        suttaArea.innerHTML = `<p class="sc-link"></p>` + html + translatorByline + suttaNavigation + commentsHtml;
        document.title = `${acronym} ${sutta_title}`;

        // Initialize features
        addNavbar();

        // Handle buttons
        if (window.innerWidth > 1000) {
            const buttons = ['cacheButton', 'infoButton', 'downloadEpubButton', 'epubInfoButton'];
            buttons.forEach(id => {
                const button = document.getElementById(id);
                if (!button) return;
                button.style.display = 'none';
            });
        }
        
        // Navigation and search
        checkSearchUrlParam();

    } catch (error) {
        console.error(error);
        suttaArea.innerHTML = `<p>Sorry, "${decodeURIComponent(slug)}" is not a valid sutta citation.
        <br><br>Note: Make sure the citation code is correct. Otherwise try finding the sutta from the home page.<br>`;
    } finally {
        // Always show footer
        footer.style.display = originalDisplay;
    }
}
