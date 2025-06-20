import getDocumentAreas from "../getDocumentAreas.js";

export default function activateSideBySideEventListenerKeyUp() {
  const { sideBySideToggle, bodyTag, suttaArea } = getDocumentAreas();

  document.onkeyup = function (e) {
    const paliHidden = suttaArea.classList.contains("hide-pali");

    if (paliHidden || e.target.id === "filter-bar" || e.key !== "s") return;

    if (localStorage.sideBySide === "true") {
      bodyTag.classList.remove("side-by-side");
      localStorage.sideBySide = "false";
      sideBySideToggle.checked = false;
      return;
    }

    bodyTag.classList.add("side-by-side");
    localStorage.sideBySide = "true";
    sideBySideToggle.checked = true;
  };
}
