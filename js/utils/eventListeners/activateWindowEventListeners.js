import fetchFooter from "../contentSections/loadFooter.js";
import fetchHeader from "../contentSections/loadHeader.js";
import { isTogglingPali } from "./initializePaliToggle.js";

export default function activateWindowEventListeners() {
  const header = document.querySelector(".mobile-header");
  let lastScrollY = window.scrollY;

  window.matchMedia("(max-width: 768px)").addEventListener("change", (event) => {
    if (event.matches) {
      document.getElementById("footer").innerHTML = "";
      fetchHeader("/header-mobile.html");
      return;
    }

    fetchFooter();
    fetchHeader("/header.html");
  });

  if (header) {
    window.addEventListener("scroll", () => {
      if (isTogglingPali) return; // Prevents the scroll event while toggling Pali

      if (window.scrollY > lastScrollY) {
        header.classList.add("hidden");
      } else {
        header.classList.remove("hidden");
      }
      lastScrollY = window.scrollY;
    });
  }
}
