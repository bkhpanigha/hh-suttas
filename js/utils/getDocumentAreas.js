

export default function getDocumentAreas()
{
    const suttaArea = document.getElementById("sutta");
    const whatsNewArea = document.getElementById('whats-new');
    const homeButton = document.getElementById("home-button");
    const themeButton = document.getElementById("theme-button");
    const bodyTag = document.querySelector("body");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");
    const searchBar = document.getElementById("search-bar");
    const form = document.getElementById('form');
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