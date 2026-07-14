import getDocumentAreas from "../getDocumentAreas.js";

let isTogglingPali = false; // Global boolean to prevent scroll event issues

const { suttaArea } = getDocumentAreas();

const setSideBySideToggleDisabled = (disable) => {
  const sideBySideLabel = document.getElementById("sideBySideLabel");
  const sideBySideToggle = document.getElementById("sideBySide");
  if (!sideBySideLabel || !sideBySideToggle) return;

  if (disable) {
    sideBySideLabel.classList.add("disabled");
    sideBySideToggle.disabled = true;
    return;
  }

  sideBySideLabel.classList.remove("disabled");
  sideBySideToggle.disabled = false;
}

if (localStorage.paliToggle !== "show") {
  localStorage.paliToggle = "hide";
  if (suttaArea) {
    suttaArea.classList.add("hide-pali");
  }

  setSideBySideToggleDisabled(true);
}

export const updatePaliSetting = () => {
  isTogglingPali = true; // Temporarily disable the scroll event

  const togglePali = () => {
    const isPaliOn = localStorage.paliToggle === "show";

    setSideBySideToggleDisabled(isPaliOn);

    if (isPaliOn) {
      if (suttaArea) {
        suttaArea.classList.add("hide-pali");
        document.body.classList.remove("side-by-side");
      }

      localStorage.paliToggle = "hide";
    } else {
      if (suttaArea) {
        suttaArea.classList.remove("hide-pali");
      }
      localStorage.paliToggle = "show";

      if (localStorage.sideBySide === "true") {
        document.body.classList.add("side-by-side");
      }
    }
  };

  const englishElements = suttaArea?.querySelectorAll(".eng-lang");

  if (englishElements && englishElements.length > 0) {
    const firstVisibleEnglishElement = Array.from(englishElements).find(
      (el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom >= 0 && rect.top <= window.innerHeight;
      }
    );

    if (firstVisibleEnglishElement) {
      const prevOffset =
        firstVisibleEnglishElement.getBoundingClientRect().top;
      togglePali();
      const newOffset =
        firstVisibleEnglishElement.getBoundingClientRect().top;
      window.scrollBy(0, newOffset - prevOffset);
    } else {
      togglePali();
    }
  } else {
    togglePali();
  }

  setTimeout(() => {
    isTogglingPali = false; // Re-enable the scroll event after a short delay
  }, 100);
}

export function initializePaliToggle() {
  // Delegated so this works even if #hide-pali/#paliToggle are injected
  // asynchronously (header/sidebar fragments) after this runs, or get
  // replaced later (e.g. header re-fetch on resize).
  document.addEventListener("click", (event) => {
    if (event.target.closest("#hide-pali, #paliToggle")) {
      updatePaliSetting();
    }
  });
}

export { isTogglingPali }; // Export the variable to use in activateWindowEventListeners.js
