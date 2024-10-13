import { scrollToHash, showNotification } from './js/utils.js'
import importLinesCount from './python-generated/suttas-count.js';
import db from "./js/dexie.js";

db.suttas.count().then((count) => {
  const isEmpty = count === 0;
  const isDataMissing = importLinesCount > count;

  if (isEmpty || isDataMissing) {
    import("./python-generated/suttas-database-data.json", { with: { type: "json" } }).then((suttas) => {
      let suttasData = suttas.default;

      const data = Object.entries(suttasData).map(([key, value]) => ({
        id: key,
        value
      }));

      db.suttas.bulkPut(data).then(() => {
        const logMessage = isEmpty ? "[SUCCESS] Database setup complete" : "[SUCCESS] Database updated.";
        console.log(logMessage);
      }).catch((error) => {
        console.error("[ERROR] Failed to insert data into database:", error);
      });
    }).catch((error) => {
      console.error("[ERROR] Failed to load suttas data:", error);
    });
  } else {
    console.log("[INFO] Database is up to date. Skipped import.");
  }
}).catch((error) => {
  console.error("[ERROR] Failed to check data count:", error);
});

const suttaArea = document.getElementById("sutta");
const whatsNewArea = document.getElementById('whats-new');
const homeButton = document.getElementById("home-button");
const themeButton = document.getElementById("theme-button");
const bodyTag = document.querySelector("body");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const forewordText = `Terms and expressions of doctrinal and practical significance found in the early Suttas are sometimes misrepresented in existing translations. Unless readers habitually compare different translations to identify discrepancies, they may unknowingly incorporate these inaccuracies into their understanding of the texts. Good examples of this include: 
  <br>
  (1) The rendition of <em>mettā</em> as “loving-kindness” or even “love” that has become ingrained in contemporary Buddhism and had an impact on the general perception of what that practice entails. Passages like <a href="https://suttas.hillsidehermitage.org/?q=sn45.55">this</a> and <a href="https://suttas.hillsidehermitage.org/?q=an8.53">this</a>, as well as the etymology of the term, undermine that popular interpretation.
  <br>
  (2) The tendency to translate the term <em>yoniso manasikāra</em> along the lines of “appropriate” or “wise” attention, evidently assuming the literal meaning of <em>yoniso</em> to be unimportant. However, there is no reason to think that the Buddha didn’t intentionally opt for this peculiar expression to describe <a href="https://suttas.hillsidehermitage.org/?q=mn2#mn2:3.1-mn2:3.3">what is arguably the core element of the practice</a>, and <a href="https://suttas.hillsidehermitage.org/?q=sn45.55">leads to the acquisition of the Noble Eightfold Path</a>.
  <br><br>
 Although our modern retrospective understanding of Pāli will always be imperfect compared to that of ancient native speakers, it should always be firmly placed first, no matter how helpful or justified the translator believes a deviation to be. When a passage or Sutta does not align with one’s interpretation, it’s the interpretation that must be altered—from the bottom up if necessary—and not the rendition:
  <br><br>
  <em>It was, and is, my attitude towards the Suttas that, if I find anything in them that is against my own view, they are right, and I am wrong.</em>
  <br>
  —<a href=https://www.nanavira.org/post-sotapatti/1963/92-l-60-2-august-1963#n60-1>Ven. Ñāṇavīra Thera</a>
  <br><br>
  This site features adaptations of Bhikkhu Sujato's copyright-free translations, crafted with this context in mind. Elucidation beyond what is explicitly stated in the Pāli and in line with my view, references to relevant Suttas, and links to relevant discussions from the Hillside Hermitage YouTube channel can be found in the comments marked with a blue asterisk (<span class="comment">*</span>).
  <br><br>
  —<em>Bhikkhu Anīgha</em>`;

// functions

// Define the goBack function globally
function goBack() {
  window.history.back();
}

async function showForeword() {
  const forewordButton = document.getElementById('foreword-button');
  suttaArea.innerHTML = `<p>${forewordText}</p>`;
  forewordButton.style.display = 'none';
  localStorage.setItem('forewordViewed', true);
}

function getSuttasByIds(suttasIds) {
  return Object.keys(availableSuttasJson).reduce((acc, suttaId) => {
    if (suttasIds.includes(suttaId)) {
      acc[suttaId] = availableSuttasJson[suttaId];
    }
    return acc;
  }, {});
}

function removeDiacritics(text) {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function loadWhatsNewArea() {
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

function displaySuttas(suttas, isSearch = false) {
  // foreword button
  const forewordViewed = localStorage.getItem('forewordViewed', false);
  const forewordButton = document.getElementById('foreword-button');

  if (forewordViewed == 'true' && forewordButton) {
    forewordButton.style.display = 'none';
  }

  // display all suttas
  const books = {
    "dn": "Dīgha Nikāya",
    "mn": "Majjhima Nikāya",
    "sn": "Saṃyutta Nikāya",
    "an": "Aṅguttara Nikāya",
    "kn": "Khuddaka Nikāya"
  };
  let currentGroup = -1;

  if (isSearch) {
    suttaArea.innerHTML += "<h2>Search Results:</h2>";
    whatsNewArea.style.display = "none";
  } else {
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

function initializePaliToggle() {
  const hideButton = document.getElementById("hide-pali");
  if (localStorage.paliToggle !== "show") {
    localStorage.paliToggle = "hide";
    suttaArea.classList.add("hide-pali");
  }
  hideButton.addEventListener("click", () => {
    const englishElements = Array.from(suttaArea.querySelectorAll(".eng-lang"));
    const firstVisibleEnglishElement = englishElements.find(el => {
      const rect = el.getBoundingClientRect();
      return rect.bottom >= 0 && rect.top <= window.innerHeight;
    });
    const togglePali = () => {
      if (localStorage.paliToggle === "show") {
        suttaArea.classList.add("hide-pali");
        localStorage.paliToggle = "hide";
        document.body.classList.remove("side-by-side");
        localStorage.sideBySide = "false";
      } else {
        suttaArea.classList.remove("hide-pali");
        localStorage.paliToggle = "show";
      }
    };
    if (firstVisibleEnglishElement) {
      const prevOffset = firstVisibleEnglishElement.getBoundingClientRect().top;
      togglePali();
      const newOffset = firstVisibleEnglishElement.getBoundingClientRect().top;
      window.scrollBy(0, newOffset - prevOffset);
    } else {
      togglePali();
    }});
}

// Event listeners

// Toggle side-by-side mode
document.onkeyup = function (e) {
  const paliHidden = document.getElementById("sutta").classList.contains("hide-pali");
  if (!paliHidden && e.target.id != "search-bar" && e.key == "s") {
    if (localStorage.sideBySide === "true") {
      bodyTag.classList.remove("side-by-side");
      localStorage.sideBySide = "false";
    } else {
      bodyTag.classList.add("side-by-side");
      localStorage.sideBySide = "true";
    }
  }
};

homeButton.addEventListener("click", () => {
  window.location.href = '/';
});

var converter = new showdown.Converter();

const response = await fetch('available_suttas.json');
const availableSuttas = await response.json();
const availableSuttasJson = availableSuttas['available_suttas'];


// initialize
if (localStorage.sideBySide) {
  if (localStorage.sideBySide == "true") {
    bodyTag.classList.add("side-by-side");
  }
} else {
  bodyTag.classList.remove("side-by-side");
}
// Function to toggle theme
function toggleTheme(useDarkTheme) {
  bodyTag.classList.remove(useDarkTheme ? "light" : "dark");
  bodyTag.classList.add(useDarkTheme ? "dark" : "light");
  localStorage.theme = useDarkTheme ? "dark" : "light";
}

// Set initial theme
const initialUseDarkTheme = localStorage.theme === "dark";
toggleTheme(initialUseDarkTheme);

// Event listener for theme toggle
themeButton.addEventListener("click", () => {
  const currentThemeIsDark = localStorage.theme === "dark";
  toggleTheme(!currentThemeIsDark);
});

// input in search bar
const searchBar = document.getElementById("search-bar");
searchBar.focus();

searchBar.addEventListener("input", async (e) => {
  const searchQuery = e.target.value.trim().toLowerCase();
  if (!searchQuery) {
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
  const suttas = getSuttasByIds(suttaIds);
  if (suttaIds.length > 0) {
    suttaArea.innerHTML = "";
    displaySuttas(suttas, true);
  }
  else {
    suttaArea.innerHTML = "<h2 class=\"no-results\">No results found</h2>";
  }
});

document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  const searchValue = searchBar.value.trim().replace(/\s/g, "");
  if (searchValue) {
    buildSutta(searchValue);
    history.pushState({ page: searchValue }, "", `?q=${searchValue}`);
  }
});

function buildSutta(slug) {
  slug = slug.toLowerCase();
  let sutta_details = availableSuttasJson[slug]
  let translator = "Bhikkhu Anīgha";
  let html = `<div class="button-area"><button id="hide-pali" class="hide-button">Toggle Pali</button></div>`;
  // TODO if file names are consistent we can get it from the availablesuttasjson
  let sutta_title = sutta_details['title'];

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
      keys_order.forEach((segment) => {
        if (translation_text[segment] === undefined) {
          translation_text[segment] = "";
        }
        let [openHtml, closeHtml] = html_text[segment].split(/{}/);
        // openHtml = openHtml.replace(/^<span class='verse-line'>/, "<br><span class='verse-line'>");

        if (window.addBreaks === true) {
          openHtml = openHtml.replace(/^<span class='verse-line'>/, "<br><span class='verse-line'>");
        }

        html +=
          `${openHtml}<span class="segment" id="${segment}">` +
          `<span class="pli-lang" lang="pi">${root_text[segment] || ''}</span>` +
          `<span class="eng-lang" lang="en">${translation_text[segment]}` +
          `${comment_text[segment] ? `<a href="#comment${commentCount}" class="comment">[${commentCount}]</a>` : ''}` +
          `</span></span>${closeHtml}\n\n`;
        
          if (comment_text[segment]) {
            if(commentCount == 1){
              commentsHtml += '<h3>Comments</h3>';
            }
            // Inside the comment HTML
            commentsHtml += `
            <p id="comment${commentCount}"><span>
              ${commentCount}: ${converter.makeHtml(comment_text[segment])
                .replace(/^<p>(.*)<\/p>$/, '$1')}
              <a href="#${segment}~no-highlight" style="cursor: pointer; font-size: 14px;">&larr;</a>
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
      if (cacheButton) cacheButton.style.display = 'none';
      if (infoButton) infoButton.style.display = 'none';

      // scroll to the quote in the url if present
      scrollToHash();
    })
    .catch(error => {
      suttaArea.innerHTML = `<p>Sorry, "${decodeURIComponent(slug)}" is not a valid sutta citation.

    <br><br>Note: Make sure the citation code is correct. Otherwise try finding the sutta from the home page.<br>`;
    });
}

function addNavbar() {
  // Add the navbar to the page
  const navbar = document.createElement('div');
  navbar.id = 'suttanav'; // Added ID
  navbar.innerHTML = document.title;
  document.body.appendChild(navbar);

  let lastScrollTop = 0; // variable to store the last scroll position
  const scrollThreshold = 10;
  let isScrolling = false;
  let scrollTimeout;

  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(() => {
        let currentScrollTop = window.scrollY || document.documentElement.scrollTop;

        // Detect sudden jump
        if (Math.abs(currentScrollTop - lastScrollTop) > 100) {
          // If the jump is large, do not show the navbar
          navbar.style.top = '-50px';
        } else if (Math.abs(currentScrollTop - lastScrollTop) > scrollThreshold) {
          // Only apply the scroll behavior if it's a regular scroll (not a sudden jump)
          navbar.style.top = currentScrollTop < 170 || currentScrollTop > lastScrollTop ? '-50px' : '0';
        }

        lastScrollTop = currentScrollTop;
        isScrolling = false;
      });
    }

    // Clear any previous timeout
    clearTimeout(scrollTimeout);

    // Set a timeout to handle the case when the user stops scrolling
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 100);
  });
}


// initialize the whole app
if (document.location.search) {
  buildSutta(document.location.search.replace("?q=", "").replace(/\s/g, "").replace(/%20/g, ""));
} else {
  displaySuttas(availableSuttasJson);
  loadWhatsNewArea();
}


document.addEventListener('click', function (event) {
  // Check if the clicked element is the foreword button
  if (event.target && event.target.id === 'foreword-button') {
    showForeword(); // Call the function to show the foreword
    displaySuttas(availableSuttasJson);
  }
  // Add a click event listener to the span element
  if (event.target && event.target.id === 'back-arrow') {
    goBack();
  }
});

const errorButton = document.getElementById('reportButton');
errorButton.textContent = 'Report an Error';
errorButton.style.display = 'block';
errorButton.style.margin = '20px 0';
errorButton.style.textAlign = 'center';
errorButton.style.backgroundColor = '#f44336';
errorButton.style.color = 'white';
errorButton.style.padding = '10px 20px';
errorButton.style.borderRadius = '5px';
errorButton.style.fontWeight = 'bold';
errorButton.style.border = 'none';
errorButton.style.cursor = 'pointer';

 // Add click event to open Google Form in a new tab
 errorButton.addEventListener('click', () => {
  window.open('https://docs.google.com/forms/d/1Ng8Csf9xYJ7UaYUyl3sGEyZ3aa2FJE_0GRS6zI6oIBM/edit', '_blank');
});

window.addEventListener('hashchange', function () {
  const hash = window.location.hash;

  // Check if the hash starts with "comment"
  if (hash.startsWith('#comment')) {
    return; // Let the browser handle the default behavior
  }

  scrollToHash();
});

document.getElementById('cacheButton').addEventListener('click', () => {
  // Check if service worker is supported by the browser
  if ('serviceWorker' in navigator) {
    // Send message to service worker to trigger caching
    try {
      showNotification("Downloading...")
      navigator.serviceWorker.controller.postMessage({ action: 'cacheResources' });
    } catch (error) {
      console.log(error);
      // TODO maybe a red colour box here?
      showNotification("An error occurred while attempting to download. Please refresh the page, wait a few seconds, and retry");
    }
  }
});

infoButton.addEventListener("click", function (event) {
  event.stopPropagation(); // Prevent click from immediately propagating to document
  let notificationBox = document.querySelector('.info-notification-box')
  if (!notificationBox) {
    notificationBox = document.createElement('div');
    notificationBox.classList.add('info-notification-box');
    document.body.appendChild(notificationBox);
  }

  if (notificationBox.style.display == 'block') {
    notificationBox.style.display = 'none';
  } else {
    notificationBox.textContent = "The ‘Download’ button makes the site available offline on the current web browser at the same URL (suttas.hillsidehermitage.org).\n\nThe site can also be installed as an application on mobile phones, by tapping ‘Install’ at the menu on the top right corner. Note that hitting the download button is still necessary to make it available offline through the app.\n\nIf downloading again (e.g., when new Suttas become available), make sure to first clear the site's data on your browser/app and reload the page.";
    notificationBox.style.display = 'block';
  }
});
// Add event listener to document to hide notificationBox when clicking outside
document.addEventListener("click", function (event) {
  let notificationBox = document.querySelector('.info-notification-box');
  if (notificationBox && notificationBox.style.display == 'block') {
    // Check if the click is outside the notificationBox and not on the infoButton
    if (!notificationBox.contains(event.target) && event.target !== infoButton) {
      notificationBox.style.display = 'none';
    }
  }
});

navigator.serviceWorker.addEventListener('message', event => {
  if (event.data && event.data.action === 'cachingSuccess') {
    showNotification("Download successful - site available offline.")
  }
  if (event.data && event.data.action === 'cachingError') {
    // TODO again maybe a different colour box
    showNotification("Caching error. Please clear site data, refresh the page, and try again.");
  }
});
