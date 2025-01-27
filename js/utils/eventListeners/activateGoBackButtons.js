import { goBack } from "../navigation/goBack.js";

export default function activateGoBackButtons()
{
    document.addEventListener('click', function (event) 
    {
        // Add a click event listener to the span element
        if (event.target && event.target.id === 'back-arrow') {
            goBack();
        }
    });
}
