import getDocumentAreas from "../getDocumentAreas.js";
import { toggleTheme } from "../misc/toggleTheme.js";

export const updateTheme = () => {
    const currentThemeIsDark = localStorage.theme === "dark";
    toggleTheme(!currentThemeIsDark);
    return !currentThemeIsDark;
};

export function activateThemeButton()
{
    const { themeButton, darkModeToggle } = getDocumentAreas();

    themeButton?.addEventListener("click", updateTheme);
    darkModeToggle?.addEventListener("click", updateTheme);
}