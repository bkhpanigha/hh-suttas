import getDocumentAreas from "../getDocumentAreas.js";

export default function activateHamburgerMenuButtons()
{
    const { hamburgerMenuOpenButton, hamburgerMenuCloseButton, hamburgerMenu } = getDocumentAreas();

    hamburgerMenuOpenButton?.addEventListener("click", () => 
    {
        if (!hamburgerMenu) return;

        hamburgerMenu.style.display = hamburgerMenu.style.display === 'block' ? 'none' : 'block';
    });

    hamburgerMenuCloseButton?.addEventListener("click", () => 
    {
        if (!hamburgerMenu) return;

        hamburgerMenu.style.display = 'none';
    });
}