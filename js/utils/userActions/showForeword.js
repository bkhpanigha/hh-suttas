import { forewordText } from "../../rawTextContent/forewordText.js";

export function showForeword() 
{
    const forewordButton = document.getElementById('foreword-button');
    suttaArea.innerHTML = `<p>${forewordText}</p>`;
    forewordButton.style.display = 'none';
    localStorage.setItem('forewordViewed', true);
}