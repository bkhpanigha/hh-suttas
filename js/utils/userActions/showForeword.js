import { forewordText } from "../../rawTextContent/forewordText.js";
import getDocumentAreas from "../getDocumentAreas.js";

export function showForeword() 
{
    const { suttaArea } = getDocumentAreas();
    const forewordButton = document.getElementById('foreword-button');
    suttaArea.innerHTML = `<p>${forewordText}</p>`;
    forewordButton.style.display = 'none';
    localStorage.setItem('forewordViewed', true);
}
