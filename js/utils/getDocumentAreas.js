

export default function getDocumentAreas()
{
    return {
        suttaArea: document.getElementById("sutta"),
        whatsNewArea: document.getElementById('whats-new'),
        filterForm: document.getElementById('filter-form'),
        homeControls: document.getElementById("home-controls"),
        homeButton: document.getElementById("home-button") || document.getElementById("home-button-mobile"),
        themeButton: document.getElementById("theme-button"),
        hidePaliButton: document.getElementById("hide-pali"),
        bodyTag: document.querySelector("body"),
        previous: document.getElementById("previous"),
        next: document.getElementById("next"),
        filterBar: document.getElementById("filter-bar"),
        suttasTabSwitcher: document.getElementById("suttasTabSwitcher"),
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
        supportButton: document.getElementById('supportButton'),
        feedbackButton: document.getElementById('feedbackButton'),
        hillsideHermitageButton: document.getElementById('hillsideHermitageButton'),
    }
}
