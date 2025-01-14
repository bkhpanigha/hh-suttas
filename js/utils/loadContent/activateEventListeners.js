import getDocumentAreas from "../getDocumentAreas.js";
import { toggleTheme } from "../misc/toggleTheme.js";
import db from "../../dexie/dexie.js";
import { displaySuttas } from "../contentSections/displaySuttas.js";
import { removeDiacritics } from "../misc/removeDiacritics.js";
import { getSuttasByIds } from "../getSuttasByIds.js";
import activateSideBySideEventListenerKeyUp from "../eventListeners/activateSideBySideEventListenerKeyUp.js";
import { activateHomeButton } from "../eventListeners/activateHomeButton.js";
import { activateThemeButton } from "../eventListeners/activateThemeButton.js";
import activateSearchBar from "../eventListeners/activateSearchBar.js";
import activateForm from "../eventListeners/activateForm.js";
import activateViewForewordAndGoBackButtons from "../eventListeners/activateViewForewordAndGoBackButtons.js";
import activateRefreshButton from "../eventListeners/activateRefreshButton.js";
import activateErrorButton from "../eventListeners/activateErrorButton.js";
import activateCacheButton from "../eventListeners/activateCacheButton.js";
import activateInfoButton from "../eventListeners/activateInfoButton.js";
import activateHideNotificationBoxWhenClickingOutside from "../eventListeners/activateHideNotificationBoxWhenClickingOutside.js";
import activateEPUBInfoButton from "../eventListeners/activateEPUBInfoButton.js";
import activateDownloadEPUBButton from "../eventListeners/activateDownloadEPUBButton.js";
import activateMessageListener from "../eventListeners/activateMessageListener.js";
import activateHashChangeListener from "../eventListeners/activateHashChangeListener.js";
import activateHandleTextSelection from "../eventListeners/activateHandleTextSelection.js";
import activateYoutubePreview from '../eventListeners/activateYoutubePreview.js';

export function activateEventListeners(availableSuttasJson)
{
    activateHomeButton();
    activateThemeButton();
    activateRefreshButton();
    activateErrorButton();
    activateCacheButton();
    activateInfoButton();
    activateHideNotificationBoxWhenClickingOutside();
    activateEPUBInfoButton();
    activateDownloadEPUBButton();
    activateMessageListener();
    
    if (!window.location.href.endsWith("/bookmarks.html") 
    && !window.location.href.endsWith("/glossary.html") 
    && !window.location.href.endsWith("/comments.html") 
    && !window.location.href.endsWith("/advanced-search.html")){
        activateSideBySideEventListenerKeyUp();
        activateViewForewordAndGoBackButtons(availableSuttasJson);
        activateHashChangeListener();
        activateForm();
        activateHandleTextSelection();
        activateYoutubePreview();
    }
}
