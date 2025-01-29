import { showNotification } from "../userActions/showNotification.js";

export default function activateMessageListener()
{
    const SUCCESS_MSG = "Download successful - site available offline.";
    const FAIL_MSG = "Caching error. Please clear site data, refresh the page, and try again."

    if (navigator.serviceWorker){
        navigator.serviceWorker.addEventListener('message', event => 
        {
            if(!event.data) return;
            if (event.data.action === 'cachingSuccess') showNotification(SUCCESS_MSG)
            if (event.data.action === 'cachingError') showNotification(FAIL_MSG);
        });
    }
}
