import getDocumentAreas from "../getDocumentAreas.js";

export function toggleTheme(useDarkTheme) 
{   
    const {bodyTag} = getDocumentAreas();

    bodyTag.classList.remove(useDarkTheme ? "light" : "dark");
    bodyTag.classList.add(useDarkTheme ? "dark" : "light");
    localStorage.theme = useDarkTheme ? "dark" : "light";
}
  