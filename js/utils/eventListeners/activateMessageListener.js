import { showNotification } from "../userActions/showNotification.js";

export default function activateMessageListener() {
    const SUCCESS_MSG = "Download successful - site available offline.";
    const FAIL_MSG = "Caching error. Please check your internet connection, clear site data, refresh the page, and try again.";

    // Get references to progress bar elements (might be null if header isn't loaded)
    const progressContainer = document.getElementById('cacheProgressContainer');
    const progressBar = document.getElementById('cacheProgressBar');
    const progressContainerMobile = document.getElementById('cacheProgressContainerMobile');
    const progressBarMobile = document.getElementById('cacheProgressBarMobile');

    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', event => {
            if (!event.data || !event.data.action) return;

            switch (event.data.action) {
                case 'cachingProgress':
                    if (progressBar) progressBar.value = event.data.progress;
                    if (progressBarMobile) progressBarMobile.value = event.data.progress;
                    // Keep the "Downloading..." notification visible
                    showNotification("Downloading for offline use...", 999999);
                    break;
                case 'cachingSuccess':
                    showNotification(SUCCESS_MSG, 5000); // Show success for 5 seconds
                    if (progressContainer) progressContainer.style.display = 'none';
                    if (progressContainerMobile) progressContainerMobile.style.display = 'none';
                    break;
                case 'cachingError':
                    showNotification(FAIL_MSG, 8000); // Show error for 8 seconds
                    if (progressContainer) progressContainer.style.display = 'none';
                    if (progressContainerMobile) progressContainerMobile.style.display = 'none';
                    break;
            }
        });
    }
}
