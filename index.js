import { scrollToHash, showNotification, changeAcronymNumber } from './js/utils.js'
const suttaArea = document.getElementById("sutta");
const homeButton = document.getElementById("home-button");
const themeButton = document.getElementById("theme-button");
const bodyTag = document.querySelector("body");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const forewordText = `Terms and expressions of doctrinal and practical significance found in the early Suttas are sometimes misrepresented in existing translations. Unless readers habitually compare different translations to identify discrepancies, they may unknowingly incorporate these inaccuracies into their understanding of the texts. Good examples of this include: 
  <br>
  (1) The rendering of <em>mettā</em> as “loving-kindness” that has become ingrained in contemporary Buddhism and had a significant impact on the general perception of what that practice entails, whereas the actual meaning of the term based on its root is “friendliness”.
  <br>
  (2) The tendency to translate the term <em>yoniso manasikāra</em> along the lines of “appropriate” or “wise” attention, evidently assuming the literal meaning of <em>yoniso</em> to be unimportant. However, there is no reason to think that the Buddha didn’t intentionally opt for this peculiar expression to describe <a href="https://suttas.hillsidehermitage.org/?q=mn2#mn2:3.1-mn2:3.3">what is arguably the core element of the practice</a>, and <a href="https://suttas.hillsidehermitage.org/?q=sn45.55">leads to the acquisition of the Noble Eightfold Path</a>.
  <br><br>
  On this site, Bhikkhu Sujato’s copyright-free translations have been adapted to create a work that rigorously aims to convey the meaning of significant Pāli terms drawing solely on their etymology—which is generally unambiguous—and eschewing commentarial and later baggage that is often present even in most Pāli dictionaries. Individual perspectives and explanations, along with the reasoning behind the chosen renderings for the infrequent less straightforward terms, have been left for the comments. This approach aims to maintain a clear distinction between translation and interpretation, which is often blurred.`;

// functions

function searchSuttas(pattern) {
  if (!fuse) { pattern = "" }; // if Fuse isn't initialized, return empty array
  pattern = pattern.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Convert pali letters in latin letters to match pali_title in available_suttas.json
  pattern = pattern.replace(/\s+/g, ' ') // Removes multiple spaces
  .replace(/(^|\s)/g, " '");

  let results = fuse.search(pattern).reduce((acc, result) => {
    acc[result.item.id] = result.item;
    return acc;
  }, {});
  // join up the id with the titles to be displayed
  return results;
}

async function showForeword() {
  const forewordButton = document.getElementById('foreword-button');
  suttaArea.innerHTML = `<p>${forewordText}</p>`;
  forewordButton.style.display = 'none';
  localStorage.setItem('forewordViewed', true);
}

function displaySuttas(suttas, isSearch = false) {
  const forewordViewed = localStorage.getItem('forewordViewed', false);
  const forewordButton = document.getElementById('foreword-button');

  if (forewordViewed == 'true' && forewordButton) {
    forewordButton.style.display = 'none';
  }

  const books = {
    "dn": "Dīgha Nikāya",
    "mn": "Majjhima Nikāya",
    "sn": "Saṃyutta Nikāya",
    "an": "Aṅguttara Nikāya",
    "kn": "Khuddaka Nikāya"
  };
  let currentGroup = -1;
  suttaArea.innerHTML += `<ul style="margin-top: 20px;">${Object.entries(suttas).map(([sutta_id, sutta_details]) => {

    const id = sutta_details['id'].replace(/\s+/g, '');;
    const title = sutta_details['title']
    const heading = sutta_details['heading'] || ""
    const link = `<a href="/?q=${id.toLowerCase()}">${id}: ${title}`;
    const em = heading ? `<span style="color: #7f6e0a;">${heading}</span>` : '';
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


function toggleThePali() {
  const hideButton = document.getElementById("hide-pali");

  // initial state
  if (localStorage.paliToggle) {
    if (localStorage.paliToggle === "hide") {
      suttaArea.classList.add("hide-pali");
    }
  } else {
    localStorage.paliToggle = "show";
  }

  hideButton.addEventListener("click", () => {
    const previousScrollPosition = window.scrollY;
    if (localStorage.paliToggle === "show") {
      suttaArea.classList.add("hide-pali");
      localStorage.paliToggle = "hide";
      document.querySelector("body").classList.remove("side-by-side");
    } else {
      suttaArea.classList.remove("hide-pali");
      localStorage.paliToggle = "show";
    }
    setTimeout(() => {
      const currentScrollPosition = window.scrollY;
      window.scrollTo(0, currentScrollPosition - (previousScrollPosition - currentScrollPosition));
    }, 0);
  });
}

async function createFuseSearch() {
  //Combine all values in a single field so user can do search on multiple fields
  let searchDict = Object.entries(availableSuttasJson).map(([sutta_id, sutta_details]) => {
    // Declare search fields here
    let sutta_details_without_fp = (({ id, title, pali_title }) => ({ id, title, pali_title }))(sutta_details);

    sutta_details_without_fp['citation'] = sutta_id;
    // Get every element's values and combine them with a white space
    const combination = Object.values(sutta_details_without_fp).join(' ')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); //pali normalized in latin for search to work on headings containing pali

    // Return new object with "combination" key added
    return {
      ...sutta_details_without_fp,
      combination: combination
    };
  });

  fuse = new Fuse(searchDict, fuseOptions);
  return fuse
}


// Event listeners

// Toggle side-by-side mode
document.onkeyup = function (e) {
  const paliHidden = document.getElementById("sutta").classList.contains("hide-pali");
  if (!paliHidden && e.target.id != "citation" && e.key == "s") {
    if (localStorage.sideBySide === "true") {
      bodyTag.classList.remove("side-by-side");
      localStorage.sideBySide = "false";
    } else {
      bodyTag.classList.add("side-by-side");
      localStorage.sideBySide = "true";
    }
  }
};

let fuseOptions = {
  includeScore: true,
  useExtendedSearch: true,
  shouldSort: false,
  keys: ['combination'],
};


homeButton.addEventListener("click", () => {
  window.location.href = '/';
});

var converter = new showdown.Converter()

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
let fuse = null;
fuse = await createFuseSearch(); // holds our search engine

const citation = document.getElementById("citation");
citation.focus();

// input in search bar
citation.addEventListener("input", e => {
  const searchQuery = e.target.value.trim().toLowerCase();
  suttaArea.innerHTML = "";
  if (searchQuery) {
    const searchResults = searchSuttas(searchQuery);
    if (Object.keys(searchResults).length > 0) {
      displaySuttas(searchResults, true);
    }
    else {
      suttaArea.innerHTML += "<h2 class=\"no-results\">No results found</h2>";
    }
  }
  else {
    displaySuttas(availableSuttasJson);
  }
});

document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  const citationValue = document.getElementById("citation").value.trim().replace(/\s/g, "");
  if (citationValue) {
    buildSutta(citationValue);
    history.pushState({ page: citationValue }, "", `?q=${citationValue}`);
  }
});

// TODO what does this line do and when is it called?
citation.value = document.location.search.replace("?q=", "").replace(/%20/g, "").replace(/\s/g, "");
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
      const keys_order = Object.keys(html_text)
      keys_order.forEach(segment => {

        if (translation_text[segment] === undefined) {
          translation_text[segment] = "";
        }
        let [openHtml, closeHtml] = html_text[segment].split(/{}/);
        // openHtml = openHtml.replace(/^<span class='verse-line'>/, "<br><span class='verse-line'>");

        if (window.addBreaks === true) {
          openHtml = openHtml.replace(/^<span class='verse-line'>/, "<br><span class='verse-line'>");
        }

        if (openHtml.includes("sutta-title")) {
          sutta_title = `${root_text[segment] || ""} : ${translation_text[segment]}`;
        }

        html += `${openHtml}<span class="segment" id="${segment}">` +
          `<span class="pli-lang" lang="pi">${root_text[segment] || ""}</span>` +
          `<span class="eng-lang" lang="en">${translation_text[segment]}` +
          `${comment_text[segment] ? `<span class="comment">*<span class="comment-text" style="display: none;">${converter.makeHtml(comment_text[segment]).replace(/^<p>(.*)<\/p>$/, '$1')}</span></span>` : ""}` +
          `</span></span>${closeHtml}\n\n`;
      });

      if (authors_text[slug]) translator = authors_text[slug];
      const translatorByline = `<div class="byline"><p>Translated by ${translator}</p></div>`;
      suttaArea.innerHTML = `<p class="sc-link"></p>` + html + translatorByline;

      let acronym = sutta_details['id'];

      document.title = `${acronym} ` + sutta_title;
      // render comments
      const commentElements = document.querySelectorAll('.comment');
      let currentlyOpenTooltip = null; // Track the currently open tooltip
      commentElements.forEach(element => {
        let commentTextSpan = element.querySelector('.comment-text')

        // Event listeners for showing/hiding the tooltip
        element.addEventListener('click', (event) => {
          event.stopPropagation();
          if (currentlyOpenTooltip && currentlyOpenTooltip !== commentTextSpan) {
            currentlyOpenTooltip.style.display = 'none'; // Hide the previously shown tooltip
          }
          commentTextSpan.style.display = 'block';
          currentlyOpenTooltip = commentTextSpan; // Update the currently open tooltip
        });

        document.addEventListener('click', (event) => {
          if (!commentTextSpan.contains(event.target)) {
            commentTextSpan.style.display = 'none';
            if (currentlyOpenTooltip === commentTextSpan) {
              currentlyOpenTooltip = null; // Reset the tracker if the current tooltip is being hidden
            }
          }
        });

      });

      toggleThePali();
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

  window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      let currentScrollTop = window.scrollY || document.documentElement.scrollTop;

      if (Math.abs(currentScrollTop - lastScrollTop) > scrollThreshold) {
        navbar.style.top = (currentScrollTop < 170 || currentScrollTop > lastScrollTop) ? '-50px' : '0';
        lastScrollTop = currentScrollTop;
      }
    });
  });
}


// initialize the whole app
if (document.location.search) {
  buildSutta(document.location.search.replace("?q=", "").replace(/\s/g, "").replace(/%20/g, ""));
} else {
  displaySuttas(availableSuttasJson);
}


document.addEventListener('click', function (event) {
  // Check if the clicked element is the foreword button
  if (event.target && event.target.id === 'foreword-button') {
    showForeword(); // Call the function to show the foreword
    displaySuttas(availableSuttasJson);
  }
});

window.addEventListener('hashchange', function () {
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
