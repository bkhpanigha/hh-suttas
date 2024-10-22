import { scrollToHash } from "../navigation/scrollToHash.js";


export default function activateHashChangeListener()
{
    window.addEventListener('hashchange', function () 
    {
        if (window.location.hash.startsWith('#comment')) return; 
        scrollToHash();
    });
      
}