import getDocumentAreas from "../getDocumentAreas.js";


export default function activateHideNotificationBoxWhenClickingOutside()
{
    const {infoButton} = getDocumentAreas();

    document.addEventListener("click", function (event) 
    {
        let notificationBox = document.querySelector('.info-notification-box');
        const targetNotInfoBox = event.target !== infoButton;
        const notificationBoxDoesNotContainTarget = (notificationBox.contains(event.target) === false)

        if (
            notificationBox &&
            notificationBox.style.display == 'block' && 
            targetNotInfoBox && 
            notificationBoxDoesNotContainTarget
        ) notificationBox.style.display = 'none';

    });
}