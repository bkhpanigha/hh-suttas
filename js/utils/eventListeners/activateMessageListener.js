import { showNotification } from "../userActions/showNotification.js";

export default function activateMessageListener() {
    const SUCCESS_MSG = "Download successful - site available offline.";
    const FAIL_MSG = "Caching error. Please check your internet connection, clear site data, refresh the page, and try again.";
    const DOWNLOADING_MSG = "Downloading for offline use...";

    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', event => {
            if (!event.data || !event.data.action) return;

            switch (event.data.action) {
                case 'cachingProgress':
                    // Update the notification with the current progress
                    // Duration is irrelevant here as it's a progress update
                    showNotification(DOWNLOADING_MSG, 999999, event.data.progress);
                    break;
                case 'cachingSuccess':
                    // Show final success message (will replace the progress notification)
                    showNotification(SUCCESS_MSG, 5000);
                    break;
                case 'cachingError':
                     // Show final error message (will replace the progress notification)
                    showNotification(FAIL_MSG, 8000);
                    break;
            }
        });
    }
}
