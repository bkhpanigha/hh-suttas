import { showNotification } from "../userActions/showNotification.js";


export default function activateCacheButton()
{
    const cacheButton = document.getElementById('cacheButton');
    const progressContainer = document.getElementById('cacheProgressContainer');
    const progressBar = document.getElementById('cacheProgressBar');
    const progressContainerMobile = document.getElementById('cacheProgressContainerMobile');
    const progressBarMobile = document.getElementById('cacheProgressBarMobile');

    cacheButton?.addEventListener('click', () =>
    {
        // Check if service worker is supported by the browser
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller)
        {
          // Show progress bar and reset value
          if (progressContainer) {
            progressContainer.style.display = 'block';
          }
          if (progressBar) {
            progressBar.value = 0;
          }
          if (progressContainerMobile) {
            progressContainerMobile.style.display = 'block';
          }
          if (progressBarMobile) {
            progressBarMobile.value = 0;
          }

          // Send message to service worker to trigger caching
          try
          {
            showNotification("Downloading for offline use...", 999999); // Keep notification until success/error
            navigator.serviceWorker.controller.postMessage({ action: 'cacheResources' });
          }
          catch (error)
          {
            console.error("Error sending message to service worker:", error);
            // Hide progress bar on error
            if (progressContainer) progressContainer.style.display = 'none';
            if (progressContainerMobile) progressContainerMobile.style.display = 'none';
            showNotification("An error occurred initiating the download. Please refresh and try again.");
          }
        } else if (!('serviceWorker' in navigator)) {
            showNotification("Your browser does not support offline functionality.<br/>Please update your browser or use another one.");
        } else {
            // Service worker might not be active yet
             showNotification("Offline functionality is initializing. Please wait a moment and try again.");
        }
      });
}
