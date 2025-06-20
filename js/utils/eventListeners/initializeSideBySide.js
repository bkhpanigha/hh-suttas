import getDocumentAreas from "../getDocumentAreas.js";

const isSideBySideOn = () => localStorage.sideBySide === "true";

export default function initializeSideBySide() {
  const { sideBySideToggle, bodyTag } = getDocumentAreas();
  const isPaliOn = localStorage.paliToggle === "show";

  if (isPaliOn && isSideBySideOn()) {
    bodyTag.classList.add("side-by-side");
  } else {
    bodyTag.classList.remove("side-by-side");
  }

  sideBySideToggle?.addEventListener("click", () => {
		const next = !isSideBySideOn();
		localStorage.sideBySide = next.toString();

    if (next) {
      bodyTag.classList.add("side-by-side");
    } else {
			bodyTag.classList.remove("side-by-side");
		}
  });
}
