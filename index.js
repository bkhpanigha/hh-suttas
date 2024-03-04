const suttaArea = document.getElementById("sutta");
const homeButton = document.getElementById("home-button");
const themeButton = document.getElementById("theme-button");
const bodyTag = document.querySelector("body");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

async function getAvailableSuttasWithTitles() {
  try {
    const response = await fetch('available_suttas.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.available_suttas.map(sutta => `${sutta.id}: ${sutta.title.trim()}`);
  } catch (error) {
    console.error('Error fetching available suttas:', error);
    return [];
  }
}


const availableSuttasArray = await getAvailableSuttasWithTitles();

const suttasArrayMod = availableSuttasArray.map(sutta => {
  const parts = sutta.split(':');
  const id = parts[0].trim();
  const title = parts[1].trim();
  return `<li><a href="/?q=${id.toLowerCase()}">${id}: ${title}</a></li>`;
});


const welcomeText = `<div class="instructions">
  <p>Available Suttas:</p>
  <ul>
    ${suttasArrayMod.join('')}
  </ul>
</div>`;

homeButton.addEventListener("click", () => {
  document.location.search = "";
});

document.onkeyup = function (e) {
  const paliHidden = document.getElementById("sutta").classList.contains("hide-pali");
  if (e.altKey && e.key == "q") {
    bodyTag.style.background = "#42428f";
    window.addBreaks = true;
  } else if (!paliHidden && e.target.id != "citation" && e.key == "s") {
    if (localStorage.sideBySide === "true") {
      bodyTag.classList.remove("side-by-side");
      localStorage.sideBySide = "false";
    } else {
      bodyTag.classList.add("side-by-side");
      localStorage.sideBySide = "true";
    }

    //bodyTag.classList.toggle("side-by-side");
  }
};

// initialize
if (localStorage.sideBySide) {
  if (localStorage.sideBySide == "true") {
    bodyTag.classList.add("side-by-side");
  }
} else {
  bodyTag.classList.remove("side-by-side");
}

if (localStorage.theme) {
  if (localStorage.theme === "dark") {
    bodyTag.classList.remove("light");
    bodyTag.classList.add("dark");
  }
} else {
  bodyTag.classList.add("light");
}

themeButton.addEventListener("click", () => {
  if (localStorage.theme === "light") {
    bodyTag.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    bodyTag.classList.remove("dark");
    localStorage.theme = "light";
  }
});

let fuse; // holds our search engine
let fuseOptions = {
  includeScore: true,
  keys: ['title', 'id'], // the keys to sx for searching
};

async function createFuseSearch() {
  const availableSuttas = await getAvailableSuttasWithTitles();
  fuse = new Fuse(availableSuttas, fuseOptions);
}

// Call this function when the page loads or when the available suttas are fetchedq
createFuseSearch();

// Step 3: Create a search function
function searchSuttas(pattern) {
  if (!fuse) return []; // if Fuse isn't initialized, return empty array
  return fuse.search(pattern).map(result => result.item);
  // return fuse.search(pattern).map(result => result.item).sort((a, b) => {
  //   const getNumber = text => parseInt(text.match(/MN(\d+)/)[1], 10);
  //   return getNumber(a) - getNumber(b);
  // });
}


function generateSuttaListHTML(suttas) {
  return suttas.map(sutta => {
    const parts = sutta.split(':');
    const id = parts[0].trim();
    const title = parts[1].trim();
    return `<li><a href="/?q=${id.toLowerCase()}">${id}: ${title}</a></li>`;
  }).join('');
}

function displaySuttas(suttas) {
  suttaArea.innerHTML = `<ul>${generateSuttaListHTML(suttas)}</ul>`;
}

// Refactored displaySearchResults to use displaySuttas
function displaySearchResults(results) {
  // Clear previous results
  suttaArea.innerHTML = '';
  // Generate and display HTML for the results
  displaySuttas(results);
}


const form = document.getElementById("form");
const citation = document.getElementById("citation");
citation.focus();

citation.addEventListener("input", e => {
  const searchQuery = e.target.value.trim();
  if (searchQuery) {
    const searchResults = searchSuttas(searchQuery);
    displaySearchResults(searchResults);
  }
  else {
    displaySuttas(availableSuttasArray);
  }
});

citation.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const citationValue = e.target.value.trim().replace(/\s/g, "");
    if (citationValue) {
      buildSutta(citationValue);
      history.pushState({ page: citationValue }, "", `?q=${citationValue}`);
    }
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

  const contentResponse = fetch(`https://suttacentral.net/api/bilarasuttas/${slug}/${translator}?lang=en`).then(response => response.json());

  const suttaplex = fetch(`https://suttacentral.net/api/suttas/${slug}/${translator}?lang=en&siteLanguage=en`).then(response => response.json());

  // Get Suttas from local repo
  //Promise.all([contentResponse, suttaplex, fetch(`suttas/${slug}.json`).then(response => response.json())])
  // Get Suttas from online repo
  Promise.all([contentResponse, suttaplex, fetch(`https://raw.githubusercontent.com/bkhpanigha/hh-suttas/main/suttas/${slug}.json`).then(response => response.json())])
    .then(responses => {
      const [contentResponse, suttaplex, ourTranslation] = responses;
      const { html_text, translation_text1, root_text, keys_order } = contentResponse;
      if (slug == "mn4"){
        html_text["mn4:2.11"] = "{}";
        html_text["mn4:2.12"] = "{}</p>";
      }
      let translation_text = ourTranslation;
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

      // TODO fix the way these pages are rendered
      document.title = `${suttaplex.suttaplex.acronym} ${suttaplex.bilara_root_text.title}: ${suttaplex.bilara_translated_text.title}`;

      toggleThePali();

      next.innerHTML = suttaplex.root_text.next.name
        ? `<a href="?q=${suttaplex.root_text.next.uid}">${suttaplex.root_text.next.name}<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="15" height="11">

      <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)">
        <g>
              <path d="M202.1 450C 196.03278 449.9987 190.56381 446.34256 188.24348 440.73654C 185.92316 435.13055 187.20845 428.67883 191.5 424.39L191.5 424.39L365.79 250.1L191.5 75.81C 185.81535 69.92433 185.89662 60.568687 191.68266 54.782654C 197.46869 48.996624 206.82434 48.91536 212.71 54.6L212.71 54.6L397.61 239.5C 403.4657 245.3575 403.4657 254.8525 397.61 260.71L397.61 260.71L212.70999 445.61C 209.89557 448.4226 206.07895 450.0018 202.1 450z" stroke="none" fill="#8f8f8f" fill-rule="nonzero" />
        </g>
      </g>
      </svg></a>`
        : "";
      previous.innerHTML = suttaplex.root_text.previous.name
        ? `<a href="?q=${suttaplex.root_text.previous.uid}"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="15" height="11">

      <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)">
        <g>
              <path d="M353 450C 349.02106 450.0018 345.20444 448.4226 342.39 445.61L342.39 445.61L157.5 260.71C 151.64429 254.8525 151.64429 245.3575 157.5 239.5L157.5 239.5L342.39 54.6C 346.1788 50.809414 351.70206 49.328068 356.8792 50.713974C 362.05634 52.099876 366.10086 56.14248 367.4892 61.318974C 368.87753 66.49547 367.3988 72.01941 363.61002 75.81L363.61002 75.81L189.32 250.1L363.61 424.39C 367.90283 428.6801 369.18747 435.13425 366.8646 440.74118C 364.5417 446.34808 359.06903 450.00275 353 450z" stroke="none" fill="#8f8f8f" fill-rule="nonzero" />
        </g>
      </g>
      </svg>${suttaplex.root_text.previous.name}</a>`
        : "";
    })
    .catch(error => {
      suttaArea.innerHTML = `<p>Sorry, "${decodeURIComponent(slug)}" is not a valid sutta citation.

    Note: Suttas that are part of a series require that you enter the exact series. For example, <code>an1.1</code> will not work, but <code>an1.1-10</code> will.<br>
    ${welcomeText}`;
    });
}

// initialize the whole app
if (document.location.search) {
  buildSutta(document.location.search.replace("?q=", "").replace(/\s/g, "").replace(/%20/g, ""));
} else {
  suttaArea.innerHTML = welcomeText;
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

const abbreviations = document.querySelectorAll("span.abbr");
abbreviations.forEach(book => {
  book.addEventListener("click", e => {
    citation.value = e.target.innerHTML;
    // form.input.setSelectionRange(10, 10);
    // citation.focus();
  });
});


// function scrollToHash() {
//   const hash = window.location.hash.substring(1); // Remove the '#' from the hash

//   if (hash) {
//     // No need to escape characters for getElementById
//     const targetElement = document.getElementById(hash);
//     if (targetElement) {
//       targetElement.style.color = "#333366"; // Dark blue for a professional look
//       targetElement.style.backgroundColor = "#f0f0f5"; // Light background to stand out
//       targetElement.style.fontWeight = "bold";
//       targetElement.style.padding = "4px 8px"; // Slight padding around the text
//       targetElement.style.borderRadius = "4px"; // Rounded corners for the border
//       targetElement.style.border = "1px solid #ccccff"; // Light border matching the color scheme
//       targetElement.style.boxShadow = "2px 2px 4px #e0e0e0"; // Subtle shadow
//       targetElement.style.fontSize = "1.5em"; // Slightly larger font size
//       targetElement.style.transition = "background-color 0.3s, color 0.3s"; // Smooth transition for color and background
//       targetElement.scrollIntoView();
//     }
//   }
// }
function scrollToHash() {
  const hash = window.location.hash.substring(1); // Remove the '#' from the hash

  if (hash) {
    const rangeMatch = hash.match(/(.*?):(\d+\.\d+)-(.*?):(\d+\.\d+)/);
    if (rangeMatch) {
      const [, startIdPrefix, startIdSuffix, endIdPrefix, endIdSuffix] = rangeMatch;
      const startFullId = `${startIdPrefix}:${startIdSuffix}`;
      const endFullId = `${endIdPrefix}:${endIdSuffix}`;
      const startElement = document.getElementById(startFullId);
      const endElement = document.getElementById(endFullId);

      if (startElement && endElement) {
        let element = startElement;
        let highlight = false;

        // Loop through sibling elements until the end element is reached
        while (element) {
          if (element.id === startFullId) {
            highlight = true;
          }

          if (highlight) {
            applyHighlightStyle(element);
          }

          if (element.id === endFullId) {
            break;
          }

          element = element.nextElementSibling;
        }

        startElement.scrollIntoView();
      }
    } else {
      // Handle single element highlighting
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        applyHighlightStyle(targetElement);
        targetElement.scrollIntoView();
      }
    }
  }
}

function applyHighlightStyle(element) {
  element.style.color = "#333366";
  element.style.fontWeight = "bold";
  // element.style.padding = "4px 8px";
  // element.style.borderRadius = "4px";
  // element.style.border = "1px solid #ccccff";
  // element.style.boxShadow = "2px 2px 4px #e0e0e0";
  element.style.fontSize = "1.5em";
  // element.style.transition = "background-color 0.3s, color 0.3s";
}


// Call this function after the content that includes the element with the ID has been added to the DOM
// scrollToHash();

