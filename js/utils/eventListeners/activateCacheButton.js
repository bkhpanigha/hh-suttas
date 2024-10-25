import { showNotification } from "../userActions/showNotification.js";


export default function activateCacheButton()
{
    document.getElementById('cacheButton').addEventListener('click', () => 
    {
        // Check if service worker is supported by the browser
        if ('serviceWorker' in navigator) 
        {
          // Send message to service worker to trigger caching
          try 
          {
            showNotification("Downloading...", 999999)
            navigator.serviceWorker.controller.postMessage({ action: 'cacheResources' });
          } 
          catch (error) 
          {
            console.log(error);
            // TODO maybe a red colour box here?
            showNotification("An error occurred while attempting to download. Please refresh the page, wait a few seconds, and retry");
          }
        }
      });
}
