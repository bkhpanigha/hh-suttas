import getDocumentAreas from "../getDocumentAreas.js";

export default function activateStopInputKeyupPropagation() {
  const { filterBar, searchInput, newLabelInput } = getDocumentAreas();

  filterBar?.addEventListener("keyup", (e) => e.stopPropagation());
  searchInput?.addEventListener("keyup", (e) => e.stopPropagation());
  newLabelInput?.addEventListener("keyup", (e) => e.stopPropagation());
}
