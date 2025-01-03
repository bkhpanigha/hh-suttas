import getDocumentAreas from "../getDocumentAreas.js";

export function initializePaliToggle() 
{
    const {suttaArea} = getDocumentAreas();

    const hideButton = document.getElementById("hide-pali");
    if (localStorage.paliToggle !== "show") {
      localStorage.paliToggle = "hide";
      suttaArea.classList.add("hide-pali");
    }
    hideButton.addEventListener("click", () => 
    {
      const englishElements = Array.from(suttaArea.querySelectorAll(".eng-lang"));
      const firstVisibleEnglishElement = englishElements.find(el => {
        const rect = el.getBoundingClientRect();
        return rect.bottom >= 0 && rect.top <= window.innerHeight;
      });
      const togglePali = () => {
        if (localStorage.paliToggle === "show") {
          suttaArea.classList.add("hide-pali");
          localStorage.paliToggle = "hide";
          document.body.classList.remove("side-by-side");
          localStorage.sideBySide = "false";
        } else {
          suttaArea.classList.remove("hide-pali");
          localStorage.paliToggle = "show";
        }
      };
      if (firstVisibleEnglishElement) {
        const prevOffset = firstVisibleEnglishElement.getBoundingClientRect().top;
        togglePali();
        const newOffset = firstVisibleEnglishElement.getBoundingClientRect().top;
        window.scrollBy(0, newOffset - prevOffset);
      } else {
        togglePali();
    }});
}