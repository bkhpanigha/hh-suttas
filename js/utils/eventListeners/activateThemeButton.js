import getDocumentAreas from "../getDocumentAreas.js";
import { toggleTheme } from "../misc/toggleTheme.js";

export function activateThemeButton()
{
    const { themeButton, darkModeToggle } = getDocumentAreas();

    const updateTheme = () => {
        const currentThemeIsDark = localStorage.theme === "dark";
        toggleTheme(!currentThemeIsDark);
    };

    themeButton?.addEventListener("click", updateTheme);
    darkModeToggle?.addEventListener("click", updateTheme);
}