import getDocumentAreas from "../getDocumentAreas.js";



export default function initializeSideBySide()
{
    const {bodyTag} = getDocumentAreas();

    if (localStorage.sideBySide) {
        if (localStorage.sideBySide == "true") {
        bodyTag.classList.add("side-by-side");
        }
    } else {
        bodyTag.classList.remove("side-by-side");
    }
}