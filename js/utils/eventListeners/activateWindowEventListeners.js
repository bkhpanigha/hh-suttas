import fetchHeader from "../contentSections/loadHeader.js";
import { isTogglingPali } from "./initializePaliToggle.js";

export default function activateWindowEventListeners() {
  const header = document.querySelector(".mobile-header");
  let lastScrollY = window.scrollY;

  window.matchMedia("(max-width: 1000px)").addEventListener("change", (event) => {
    if (event.matches) {
      fetchHeader("/header-mobile.html");
      return;
    }

    fetchHeader("/header.html");
  });

  if (header) {
    window.addEventListener("scroll", () => {
      if (isTogglingPali) return; // Prevents the scroll event while toggling Pali

      if (lastScrollY <= header?.offsetHeight) {
        header.classList.remove("hidden");
      } else if (window.scrollY > lastScrollY) {
        header.classList.add("hidden");
      } else {
        header.classList.remove("hidden");
      }
  
      lastScrollY = window.scrollY;
    });
  }
}
