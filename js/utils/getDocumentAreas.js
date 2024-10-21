

export default function getDocumentAreas()
{
    const suttaArea = document.getElementById("sutta");
    const whatsNewArea = document.getElementById('whats-new');
    const homeButton = document.getElementById("home-button");
    const themeButton = document.getElementById("theme-button");
    const bodyTag = document.querySelector("body");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");

    return {suttaArea, whatsNewArea, homeButton, themeButton, bodyTag, previous, next};
}