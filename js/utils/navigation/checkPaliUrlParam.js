import getDocumentAreas from "../getDocumentAreas.js";

export function checkPaliUrlParam(){
	const {suttaArea} = getDocumentAreas();
    const urlParams = new URLSearchParams(window.location.search);

	if (urlParams.get('pali') === 'show' && localStorage.paliToggle === "hide") {
    	// If pali is hidden but url parameter is set to "show", show pali
		suttaArea.classList.remove("hide-pali");
		localStorage.paliToggle = "show";
	} else if (urlParams.get('pali') === 'hide' && localStorage.paliToggle === "show") {
    	// If pali is shown but url parameter is set to "hide",hide pali
		suttaArea.classList.add("hide-pali");
		localStorage.paliToggle = "hide";
		document.body.classList.remove("side-by-side");
		localStorage.sideBySide = "false";
	}
}