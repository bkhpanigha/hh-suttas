import { displaySuttas } from "../contentSections/displaySuttas.js";
import { goBack } from "../navigation/goBack.js";

export default function activateViewForewordAndGoBackButtons(availableSuttasJson)
{
    document.addEventListener('click', function (event) 
    {
        // Add a click event listener to the span element
        if (event.target && event.target.id === 'back-arrow') {
            goBack();
        }
    });
}
