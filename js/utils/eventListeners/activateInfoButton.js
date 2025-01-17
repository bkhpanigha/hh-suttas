import getDocumentAreas from "../getDocumentAreas.js";


export default function activateInfoButton()
{
    const {infoButton} = getDocumentAreas();

    infoButton?.addEventListener("click", function (event) 
    {
        event.stopPropagation(); // Prevent click from immediately propagating to document
        let notificationBox = document.querySelector('.info-notification-box')
        if (!notificationBox) 
        {
          notificationBox = document.createElement('div');
          notificationBox.classList.add('info-notification-box');
          document.body.appendChild(notificationBox);
        }
      
        if (notificationBox.style.display == 'block') notificationBox.style.display = 'none';
        else 
        {
          notificationBox.textContent = "The ‘Use Offline’ button makes the site available offline on the current web browser at the same URL (suttas.hillsidehermitage.org).\n\nThe site can also be installed as an application on mobile phones, by tapping ‘Install’ at the menu on the top right corner. Note that hitting the ‘Use Offline’ button is still necessary to make it available offline through the app.\n\nIf downloading again (e.g., when new Suttas become available), make sure to first clear the site's data on your browser/app and reload the page.";
          notificationBox.style.display = 'block';
        }
    });
}