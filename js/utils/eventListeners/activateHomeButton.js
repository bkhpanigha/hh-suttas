import getDocumentAreas from "../getDocumentAreas.js";

export function activateHomeButton()
{
    const {homeButton} = getDocumentAreas();

    homeButton.addEventListener("click", () => 
    {
        window.location.href = '/';
    });
}