import fetchFooter from "../contentSections/loadFooter.js";
import fetchHeader from "../contentSections/loadHeader.js";

export default function activateWindowEventListeners() {
  const header = document.querySelector(".mobile-header");
  let lastScrollY = window.scrollY;

  window.matchMedia("(max-width: 1000px)").addEventListener("change", (event) => {
    if (event.matches) {
      document.getElementById("footer").innerHTML = "";
      fetchHeader("/header-mobile.html");
      return;
    }

    fetchFooter();
    fetchHeader("/header.html");
  });

  window.addEventListener("scroll", () => {
      if (window.scrollY > lastScrollY) {
          header.classList.add("hidden");
      } else {
          header.classList.remove("hidden");
      }
      lastScrollY = window.scrollY;
  });
}
