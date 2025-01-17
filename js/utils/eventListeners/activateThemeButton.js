import getDocumentAreas from "../getDocumentAreas.js";
import { toggleTheme } from "../misc/toggleTheme.js";

export function activateThemeButton()
{
    const {themeButton} = getDocumentAreas();

    themeButton?.addEventListener("click", () => 
    {
        const currentThemeIsDark = localStorage.theme === "dark";
        toggleTheme(!currentThemeIsDark);
    });
    
}