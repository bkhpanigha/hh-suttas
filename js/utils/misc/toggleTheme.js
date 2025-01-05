export function toggleTheme(useDarkTheme) 
{   
    document.documentElement.classList.remove(useDarkTheme ? "light" : "dark");
    document.documentElement.classList.add(useDarkTheme ? "dark" : "light");
    localStorage.theme = useDarkTheme ? "dark" : "light";
}
