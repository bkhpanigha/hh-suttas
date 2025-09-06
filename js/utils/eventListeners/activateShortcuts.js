import getDocumentAreas from "../getDocumentAreas.js";
import { updateTheme } from "./activateThemeButton.js";
import { updatePaliSetting } from "./initializePaliToggle.js";

export default function activateShortcuts() {
  const {
    leftSidebar,
    rightSidebar,
    sideBySideToggle,
    paliToggle,
    darkModeToggle,
    bodyTag,
    shortcutsModal,
    openButton,
    closeButton,
  } = getDocumentAreas();

  const toggleShortcutsModal = () => {
    shortcutsModal.classList.toggle("hide");
  };

  const closeShortcutsModal = () => {
    shortcutsModal.classList.add("hide");
  };

  openButton?.addEventListener("click", toggleShortcutsModal);
  closeButton?.addEventListener("click", closeShortcutsModal);
  shortcutsModal?.addEventListener("click", (e) => {
    if (e.target === shortcutsModal) {
      closeShortcutsModal();
    }
  });

  const toggleDarkMode = () => {
    darkModeToggle.checked = updateTheme();
  };

  const toggleFullscreenMode = () => {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        // Safari
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        // IE/Edge
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        // Safari
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
      }
    }
  };

  const togglePali = () => {
    updatePaliSetting();
    paliToggle.checked = localStorage.paliToggle === "show";
  };

  const toggleQuietMode = () => {
    const areSidebarsHidden =
      localStorage.isLeftSidebarHidden === "true" &&
      localStorage.isRightSidebarHidden === "true";
    const shouldHide = !areSidebarsHidden;

    leftSidebar.classList.toggle("collapsed", shouldHide);
    rightSidebar.classList.toggle("collapsed", shouldHide);
    localStorage.isLeftSidebarHidden = shouldHide;
    localStorage.isRightSidebarHidden = shouldHide;
  };

  const toggleSideBySide = (e) => {
    const isPaliHidden = localStorage.paliToggle === "hide";
    const isFilterBar = e.target.id === "filter-bar";

    if (isPaliHidden || isFilterBar) return;

    const sideBySideDisabled = localStorage.sideBySide === "false";
    bodyTag.classList.toggle("side-by-side", sideBySideDisabled);
    localStorage.sideBySide = sideBySideDisabled;
    sideBySideToggle.checked = sideBySideDisabled;
  };

  document.addEventListener("keyup", (e) => {
    if (e.target.closest("input, textarea, select, [contenteditable]")) return;

    switch (e.key) {
      case "d":
        toggleDarkMode();
        return;
      case "f":
        toggleFullscreenMode();
        return;
      case "k":
        toggleShortcutsModal();
        return;
      case "p":
        togglePali();
        return;
      case "q":
        toggleQuietMode();
        return;
      case "s":
        toggleSideBySide(e);
        return;
      case "Escape":
        closeShortcutsModal();
        return;
      default:
        return;
    }
  });
}
