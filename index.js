import { scrollToHash, changeAcronymNumber } from './utils.js'
const suttaArea = document.getElementById("sutta");
const homeButton = document.getElementById("home-button");
const themeButton = document.getElementById("theme-button");
const bodyTag = document.querySelector("body");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

// functions

async function getAvailableSuttas({ mergedTitle = true } = {}) {
  try {
    const response = await fetch('available_suttas.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (mergedTitle) {
      return data.available_suttas.map(sutta => `${sutta.id}: ${sutta.title.trim()}`);
    }
    else {
      return data
    }
  } catch (error) {
    console.error('Error fetching available suttas:', error);
    return [];
  }
}

function searchSuttas(pattern) {
  if (!fuse) { pattern = "" }; // if Fuse isn't initialized, return empty array
  pattern = pattern.replace(/([a-zA-Z]{2})(\d+)/, '$1 $2');
  let results = fuse.search(pattern).map(result => result.item);
  // join up the id with the titles to be displayed
  return results.map(sutta => `${sutta.id}: ${sutta.title.trim()}`);
}

function getSuttaTitleById(id) {
  // TODO this is inefficient
  // change the structure of available_suttas.json to be able to look up by id
  const sutta = availableSuttasJson['available_suttas'].find(sutta => sutta.id === id);
  return sutta ? sutta.title.trim() : "";
}

function displaySuttas(suttas) {
  suttaArea.innerHTML = `<ul>${suttas.map(sutta => {
    const parts = sutta.split(':');
    const id = parts[0].trim();
    const title = parts[1].trim();
    return `<li><a href="/?q=${id.toLowerCase()}">${id}: ${title}</a></li>`;
  }).join('')}</ul>`;
  //Add listener for Download button
  setTimeout(function(){
    suttaArea.innerHTML += `<button id="cacheButton">Download</button>`
    document.getElementById('cacheButton').addEventListener('click', () => {
      // Check if service worker is supported by the browser
      if ('serviceWorker' in navigator) {
          // Send message to service worker to trigger caching
          try {
          navigator.serviceWorker.controller.postMessage({ action: 'cacheResources' });
          } catch (error) {
            suttaArea.innerHTML += `<p>An error occurred while attempting to download. Please refresh the page, wait a few seconds, and retry.</p>`;

          }
      } 
    })
  }, 3000);
 
  
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.action === 'cachingSuccess') {
      // Update HTML or show a success message to the user
      // For example, you can display a success message in a specific element with ID "successMessage"
      suttaArea.innerHTML += `<p>Download successful.</p>`;
    }
    if (event.data && event.data.action === 'cachingError') {
      // Update HTML or show a success message to the user
      // For example, you can display a success message in a specific element with ID "successMessage"
      suttaArea.innerHTML += `<p>Caching error. Please clear site data, refresh the page, and try again.</p>`;
    }
  });
  
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
  const availableSuttas = await getAvailableSuttas({ mergedTitle: false });
  fuse = new Fuse(availableSuttas['available_suttas'], fuseOptions);
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
  keys: ['id', 'title'], // Id then title in terms of priority
};


homeButton.addEventListener("click", () => {
  document.location.search = "";
});

const availableSuttasJson = await getAvailableSuttas({ mergedTitle: false })
const availableSuttasArray = await getAvailableSuttas();

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

let fuse = createFuseSearch(); // holds our search engine

const citation = document.getElementById("citation");
citation.focus();

citation.addEventListener("input", e => {
  const searchQuery = e.target.value.trim();
  if (searchQuery) {
    const searchResults = searchSuttas(searchQuery);
    displaySuttas(searchResults);
  }
  else {
    displaySuttas(availableSuttasArray);
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


citation.value = document.location.search.replace("?q=", "").replace(/%20/g, "").replace(/\s/g, "");
function buildSutta(slug) {
  let translator = "";
  let slugArray = slug.split("&");
  slug = slugArray[0];
  if (slugArray[1]) {
    translator = slugArray[1];
  } else {
    translator = "sujato";
  }
  slug = slug.toLowerCase();

  if (slug.match(/bu|bi|kd|pvr/)) {
    translator = "brahmali";
    slug = slug.replace(/bu([psan])/, "bu-$1");
    slug = slug.replace(/bi([psn])/, "bi-$1");
    if (!slug.match("pli-tv-")) {
      slug = "pli-tv-" + slug;
    }
    if (!slug.match("vb-")) {
      slug = slug.replace("bu-", "bu-vb-");
    }
    if (!slug.match("vb-")) {
      slug = slug.replace("bi-", "bi-vb-");
    }
  }

  let html = `<div class="button-area"><button id="hide-pali" class="hide-button">Toggle Pali</button></div>`;


  const rootResponse = fetch(`suttas/root/mn/${slug}_root-pli-ms.json`).then(response => response.json());
  const translationResponse = fetch(`suttas/translation_en/${slug}.json`).then(response => response.json());
  const htmlResponse = fetch(`suttas/html/mn/${slug}_html.json`).then(response => response.json());

  // Get root, translation and html jsons from folder
  Promise.all([htmlResponse, rootResponse, translationResponse])
    .then(responses => {
      const [html_text, root_text, translation_text] = responses;
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

        html += `${openHtml}<span class="segment" id ="${segment}"><span class="pli-lang" lang="pi">${root_text[segment] ? root_text[segment] : ""}</span><span class="eng-lang" lang="en">${translation_text[segment]}</span></span>${closeHtml}\n\n`;

      });
      //console.log(html);
      const scLink = `<p class="sc-link"></p>`;

      const translatorByline = `<div class="byline"><p>Translated by Bhikkhu Anīgha</p></div>`;
      suttaArea.innerHTML = scLink + html + translatorByline;
      const acronym = slug.replace(/([a-zA-Z]{2})(\d+)/, '$1 $2').toUpperCase();
      // TODO fix the way these pages are rendered
      document.title = `${acronym} ${root_text[`${slug}:0.2`]}: ${translation_text[`${slug}:0.2`]}`;

      toggleThePali();

      let incrementedAcronym = changeAcronymNumber(acronym, 1);
      let decrementedAcronym = changeAcronymNumber(acronym, -1);

      const previousSuttaTitle = getSuttaTitleById(decrementedAcronym);
      const nextSuttaTitle = getSuttaTitleById(incrementedAcronym);
      next.innerHTML = nextSuttaTitle ? `<a href="?q=${incrementedAcronym.toLowerCase()}">${nextSuttaTitle}<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="15" height="11">

        <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)">
          <g>
                <path d="M202.1 450C 196.03278 449.9987 190.56381 446.34256 188.24348 440.73654C 185.92316 435.13055 187.20845 428.67883 191.5 424.39L191.5 424.39L365.79 250.1L191.5 75.81C 185.81535 69.92433 185.89662 60.568687 191.68266 54.782654C 197.46869 48.996624 206.82434 48.91536 212.71 54.6L212.71 54.6L397.61 239.5C 403.4657 245.3575 403.4657 254.8525 397.61 260.71L397.61 260.71L212.70999 445.61C 209.89557 448.4226 206.07895 450.0018 202.1 450z" stroke="none" fill="#8f8f8f" fill-rule="nonzero" />
          </g>
        </g>
        </svg></a>`
        : "";
      previous.innerHTML = previousSuttaTitle ? `<a href="?q=${decrementedAcronym.toLowerCase()}"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="15" height="11">

        <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)">
          <g>
                <path d="M353 450C 349.02106 450.0018 345.20444 448.4226 342.39 445.61L342.39 445.61L157.5 260.71C 151.64429 254.8525 151.64429 245.3575 157.5 239.5L157.5 239.5L342.39 54.6C 346.1788 50.809414 351.70206 49.328068 356.8792 50.713974C 362.05634 52.099876 366.10086 56.14248 367.4892 61.318974C 368.87753 66.49547 367.3988 72.01941 363.61002 75.81L363.61002 75.81L189.32 250.1L363.61 424.39C 367.90283 428.6801 369.18747 435.13425 366.8646 440.74118C 364.5417 446.34808 359.06903 450.00275 353 450z" stroke="none" fill="#8f8f8f" fill-rule="nonzero" />
          </g>
        </g>
        </svg>${previousSuttaTitle}</a>`
        : "";
      scrollToHash();
    })
    .catch(error => {
      suttaArea.innerHTML = `<p>Sorry, "${decodeURIComponent(slug)}" is not a valid sutta citation.

    Note: Suttas that are part of a series require that you enter the exact series. For example, <code>an1.1</code> will not work, but <code>an1.1-10</code> will.<br>`;
    });
}

// initialize the whole app
if (document.location.search) {
  buildSutta(document.location.search.replace("?q=", "").replace(/\s/g, "").replace(/%20/g, ""));
} else {
  displaySuttas(availableSuttasArray);
}


window.addEventListener('hashchange', function() {
  scrollToHash();
});

