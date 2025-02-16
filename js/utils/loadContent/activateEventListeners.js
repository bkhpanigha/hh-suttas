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
import activateWindowEventListeners from "../eventListeners/activateWindowEventListeners.js";
import activateHamburgerMenuButtons from "../eventListeners/activateHamburgerMenuButtons.js";
import activateSettingsButtons from "../eventListeners/activateSettingsButtons.js";
import initializeFuse from '../eventListeners/initializeFuse.js';
import activateTopButtonsTouchAnimation from '../eventListeners/activateTopButtonsTouchAnimation.js';
import { initializePaliToggle } from "../eventListeners/initializePaliToggle.js";
import initializeSideBySide from "../eventListeners/initializeSideBySide.js";

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
    activateWindowEventListeners();
    activateHamburgerMenuButtons();
    activateSettingsButtons();
    initializePaliToggle();
    
    activateTopButtonsTouchAnimation();
	
    if (!window.location.href.endsWith("/bookmarks.html") 
    && !window.location.href.endsWith("/glossary.html") 
    && !window.location.href.endsWith("/comments.html") 
    && !window.location.href.endsWith("/search-panel.html")){
        activateSideBySideEventListenerKeyUp();
        initializeFuse(availableSuttasJson);
        activateFilterBar(availableSuttasJson);
        activateGoBackButtons();
        activateHashChangeListener();
        activateFilterForm();
        activateHandleTextSelection();
        activateYoutubePreview();
        initializeSideBySide();
    }
}
