

export default function getDocumentAreas()
{
    let suttaArea = null;
    let whatsNewArea = null;
    let form = null;
    if (!window.location.href.endsWith("/bookmarks.html") 
	&& !window.location.href.endsWith("/glossary.html") 
	&& !window.location.href.endsWith("/comments.html")
	&& !window.location.href.endsWith("/advanced-search.html")){
        suttaArea = document.getElementById("sutta");
        whatsNewArea = document.getElementById('whats-new');
        form = document.getElementById('form');
    }
    const homeButton = document.getElementById("home-button");
    const themeButton = document.getElementById("theme-button");
    const bodyTag = document.querySelector("body");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");
    const searchBar = document.getElementById("search-bar");
    const infoButton = document.getElementById('infoButton');

    return {
        suttaArea, 
        whatsNewArea, 
        homeButton, 
        themeButton, 
        bodyTag, 
        previous, 
        next, 
        searchBar,
        form,
        infoButton,
    };
}
