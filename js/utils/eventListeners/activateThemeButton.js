import getDocumentAreas from "../getDocumentAreas.js";

export function activateThemeButton()
{
    const {themeButton} = getDocumentAreas();

    themeButton.addEventListener("click", () => 
    {
        const currentThemeIsDark = localStorage.theme === "dark";
        toggleTheme(!currentThemeIsDark);
    });
    
}