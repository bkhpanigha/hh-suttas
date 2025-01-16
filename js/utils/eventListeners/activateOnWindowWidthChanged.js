import fetchFooter from "../contentSections/loadFooter.js";
import fetchHeader from "../contentSections/loadHeader.js";

export default function activateOnWindowWidthChanged() {
  window.matchMedia("(max-width: 1000px)").addEventListener("change", (event) => {
    if (event.matches) {
      document.getElementById("footer").innerHTML = "";
      fetchHeader("/header-mobile.html");
      return;
    }

    fetchFooter();
    fetchHeader("/header.html");
  });
}
