import getDocumentAreas from "../getDocumentAreas.js";

let isTogglingPali = false; // Global boolean to prevent scroll event issues

export function initializePaliToggle() {
    const { suttaArea, hidePaliButton, paliToggle } = getDocumentAreas();

    if (localStorage.paliToggle !== "show") {
        localStorage.paliToggle = "hide";
		if (suttaArea)
			suttaArea.classList.add("hide-pali");
    }

    const updatePaliSetting = () => {
        isTogglingPali = true; // Temporarily disable the scroll event

        const togglePali = () => {
            if (localStorage.paliToggle === "show") {
				if (suttaArea){
					suttaArea.classList.add("hide-pali");
					document.body.classList.remove("side-by-side");
				}
                localStorage.paliToggle = "hide";
                localStorage.sideBySide = "false";
            } else {
				if (suttaArea)
					suttaArea.classList.remove("hide-pali");
                localStorage.paliToggle = "show";
            }
        };

        const englishElements = suttaArea?.querySelectorAll(".eng-lang");

		if (englishElements && englishElements.length > 0) {
			const firstVisibleEnglishElement = Array.from(englishElements).find(el => {
				const rect = el.getBoundingClientRect();
				return rect.bottom >= 0 && rect.top <= window.innerHeight;
			});

			if (firstVisibleEnglishElement) {
				const prevOffset = firstVisibleEnglishElement.getBoundingClientRect().top;
				togglePali();
				const newOffset = firstVisibleEnglishElement.getBoundingClientRect().top;
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
    };

    hidePaliButton?.addEventListener("click", updatePaliSetting);
    paliToggle?.addEventListener("click", updatePaliSetting);
}

export { isTogglingPali }; // Export the variable to use in activateWindowEventListeners.js
