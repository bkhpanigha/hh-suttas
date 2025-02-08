

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

    const documentAreas = {
        homeButton: document.getElementById("home-button"),
        themeButton: document.getElementById("theme-button"),
        hidePaliButton: document.getElementById("hide-pali"),
        bodyTag: document.querySelector("body"),
        previous: document.getElementById("previous"),
        next: document.getElementById("next"),
        searchBar: document.getElementById("search-bar"),
        infoButton: document.getElementById('infoButton'),
        hamburgerMenuOpenButton: document.getElementById('hamburger-menu-open-button'),
        hamburgerMenuCloseButton: document.getElementById('hamburger-menu-close-button'),
        hamburgerMenu: document.getElementById('hamburger-menu'),
        settingsOpenButton: document.getElementById('settings-open-button'),
        settingsCloseButton: document.getElementById('settings-close-button'),
        settings: document.getElementById('settings'),
        darkModeToggle: document.getElementById("theme"),
        paliToggle: document.getElementById("paliToggle"),
        offlineToggle: document.getElementById("offline-toggle"),
    }

    return {
        suttaArea,
        whatsNewArea,
        form,
        ...documentAreas,
    };
}
