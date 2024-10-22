export default function activateEPUBInfoButton()
{
    const epubInfoButton = document.getElementById('epubInfoButton');
    let lastModifiedDate; //looks like this was a placeholder for future logic.

    epubInfoButton.addEventListener("click", function (event) 
    {
        event.stopPropagation();
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
            notificationBox.textContent = "The ‘Get Ebook’ button lets you download the translations and comments in an Ebook with the ‘.epub’ format." + (lastModifiedDate != null ? "\n\nLast updated: " + lastModifiedDate : "");
            notificationBox.style.display = 'block';
        }
    });
}