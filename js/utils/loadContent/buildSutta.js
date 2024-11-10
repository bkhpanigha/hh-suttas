import getDocumentAreas from "../getDocumentAreas.js";
import { scrollToHash } from "../navigation/scrollToHash.js";
import { addNavbar } from "./addNavbar.js";
import { initializePaliToggle } from "./initializePaliToggle.js";
import { checkSearchUrlParam } from '../navigation/checkSearchUrlParam.js';

export function buildSutta(slug, availableSuttasJson) 
{
    const footer = document.getElementById('footer');
    const originalDisplay = footer.style.display;
    footer.style.display = 'none';

    const converter = new showdown.Converter();
    const {suttaArea} = getDocumentAreas();

    slug = slug.toLowerCase();
    const sutta_details = availableSuttasJson[slug]

    let translator = "Bhikkhu Anīgha";
    let html = `<div class="button-area"><button id="hide-pali" class="hide-button">Toggle Pali</button></div>`;
    const sutta_title = sutta_details['title'];

    const rootResponse = fetch(sutta_details['root_path']).then(response => response.json());
    const translationResponse = fetch(sutta_details['translation_path']).then(response => response.json());
    const htmlResponse = fetch(sutta_details['html_path']).then(response => response.json());
    const commentResponse = fetch(sutta_details['comment_path'])
    .then(response => {
      if (!response.ok) throw new Error(`Comment file not found for ${slug}`);
      return response.json();
    })
    .catch(error => {
      console.warn(error.message);
      return {}; // Return an empty object if the comment file is not found
    });

    const authors = fetch(`authors.json`).then(response => response.json());

    // Get root, translation and html jsons from folder
    Promise.all([htmlResponse, rootResponse, translationResponse, commentResponse, authors])
        .then(responses => {
        const [html_text, root_text, translation_text, comment_text, authors_text] = responses;
        const keys_order = Object.keys(html_text);
        let commentCount = 1;
        let commentsHtml = '';

        keys_order.forEach((segment) => 
        {
            if (translation_text[segment] === undefined) translation_text[segment] = "";

            let [openHtml, closeHtml] = html_text[segment].split(/{}/);

            if (window.addBreaks === true) 
            {
                openHtml = openHtml.replace(/^<span class='verse-line'>/, "<br><span class='verse-line'>");
            }

            html +=
            `${openHtml}<span class="segment" id="${segment}">` +
            `<span class="pli-lang" lang="pi">${root_text[segment] || ''}</span>` +
            `<span class="eng-lang" lang="en">${translation_text[segment]}` +
            `${comment_text[segment] ? `<a href="${window.location.origin}?q=${slug}#comment${commentCount}" class="comment">[${commentCount}]</a>` : ''}` +
            `</span></span>${closeHtml}\n\n`;
        
            if (comment_text[segment]) 
            {
                if(commentCount == 1) commentsHtml += '<h3>Comments</h3>';

                // Inside the comment HTML
                commentsHtml += `
                <p id="comment${commentCount}"><span>
                ${commentCount}: ${converter.makeHtml(comment_text[segment])
                    .replace(/^<p>(.*)<\/p>$/, '$1')}
                <a href="${window.location.origin}?q=${slug}#${segment}~no-highlight" style="cursor: pointer; font-size: 14px;">&larr;</a>
                </span></p>
                `;
    
                commentCount++;
          }
      });

      if (authors_text[slug]) translator = authors_text[slug];
      const translatorByline = `<div class="byline"><p>Translated by ${translator}</p></div>`;
      // render comments
      
      suttaArea.innerHTML = `<p class="sc-link"></p>` + html + translatorByline + commentsHtml;

      let acronym = sutta_details['id'];

      document.title = `${acronym} ` + sutta_title;

      initializePaliToggle();
      addNavbar();

      // remove download and info button
      const cacheButton = document.getElementById('cacheButton');
      const infoButton = document.getElementById('infoButton');
      const downloadEpubButton = document.getElementById('downloadEpubButton');
      const epubInfoButton = document.getElementById('epubInfoButton');
      if (cacheButton) cacheButton.style.display = 'none';
      if (infoButton) infoButton.style.display = 'none';
      if (downloadEpubButton) downloadEpubButton.style.display = 'none';      
      if (epubInfoButton) epubInfoButton.style.display = 'none';

      footer.style.display = originalDisplay;
      
	  // highlight search term
	  checkSearchUrlParam();
	  
      // scroll to the quote in the url if present
      scrollToHash();
	  
	  
    })
    .catch(error => {
      console.log(error);
      suttaArea.innerHTML = `<p>Sorry, "${decodeURIComponent(slug)}" is not a valid sutta citation.

    <br><br>Note: Make sure the citation code is correct. Otherwise try finding the sutta from the home page.<br>`;
    });
}
