import getDocumentAreas from "../getDocumentAreas.js";
import { toggleTheme } from "../misc/toggleTheme.js";
import db from "../../dexie/dexie.js";
import { displaySuttas } from "../contentSections/displaySuttas.js";
import { removeDiacritics } from "../misc/removeDiacritics.js";
import { getSuttasByIds } from "../getSuttasByIds.js";
import activateSideBySideEventListenerKeyUp from "../eventListeners/activateSideBySideEventListenerKeyUp.js";
import { activateHomeButton } from "../eventListeners/activateHomeButton.js";
import { activateThemeButton } from "../eventListeners/activateThemeButton.js";
import activateFilterBar from "../eventListeners/activateFilterBar.js";
import activateFilterForm from "../eventListeners/activateFilterForm.js";
import activateGoBackButtons from "../eventListeners/activateGoBackButtons.js";
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
import initializeFuse from '../eventListeners/initializeFuse.js';

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
    && !window.location.href.endsWith("/search-panel.html")){
        activateSideBySideEventListenerKeyUp();
        initializeFuse(availableSuttasJson);
        activateFilterBar(availableSuttasJson);
        activateGoBackButtons(availableSuttasJson);
        activateHashChangeListener();
        activateFilterForm();
        activateHandleTextSelection();
        activateYoutubePreview();
    }
}
