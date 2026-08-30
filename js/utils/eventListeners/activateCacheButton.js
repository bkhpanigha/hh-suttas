import { showNotification } from "../userActions/showNotification.js";


export default function activateCacheButton()
{
    const cacheButton = document.getElementById('cacheButton');

    cacheButton?.addEventListener('click', () =>
    {
        // Check if service worker is supported and active
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller)
        {
          // Send message to service worker to trigger caching
          try
          {
            // Show initial progress notification (progress = 0)
            // Duration is irrelevant here as it will be replaced by progress updates or final message
            showNotification("Downloading for offline use...", 999999, 0);
            navigator.serviceWorker.controller.postMessage({ action: 'cacheResources' });
          }
          catch (error)
          {
            console.error("Error sending message to service worker:", error);
            // Show error notification if sending the message fails
            showNotification("An error occurred initiating the download. Please refresh and try again.", 5000);
          }
        } else if (!('serviceWorker' in navigator)) {
            // Browser doesn't support service workers
            showNotification("Your browser does not support offline functionality.<br/>Please update your browser or use another one.", 8000);
        } else {
            // Service worker exists but isn't controlling the page yet (e.g., first load)
             showNotification("Offline functionality is initializing. Please wait a moment and try again.", 5000);
        }
      });
}
