import { displaySuttas } from "../contentSections/displaySuttas.js";
import { goBack } from "../navigation/goBack.js";
import { showForeword } from "../userActions/showForeword.js";


export default function activateViewForewordAndGoBackButtons()
{
    document.addEventListener('click', function (event) 
    {
        // Check if the clicked element is the foreword button
        if (event.target && event.target.id === 'foreword-button') {
            showForeword(); // Call the function to show the foreword
            displaySuttas(availableSuttasJson);
        }
        // Add a click event listener to the span element
        if (event.target && event.target.id === 'back-arrow') {
            goBack();
        }
    });
}