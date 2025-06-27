import getDocumentAreas from "../getDocumentAreas.js";

export default function activateSidebarToggles() {
  const { leftSidebar, leftSidebarToggle, rightSidebar, rightSidebarToggle } = getDocumentAreas();
  if (!leftSidebar || !leftSidebarToggle || !rightSidebar || !rightSidebarToggle) return;

  const activateSidebarToggle = (sidebar, toggle, storageKey, bodyClass) => {
    // Initial state application
    let isHidden = localStorage[storageKey] === "true";
    sidebar.classList.toggle("collapsed", isHidden);
    document.body.classList.toggle(bodyClass, isHidden);

    // Event listener for toggling
    toggle.addEventListener("click", () => {
      isHidden = localStorage[storageKey] === "true"; // Get current state before toggle
      const newHiddenState = !isHidden;
      
      sidebar.classList.toggle("collapsed", newHiddenState);
      document.body.classList.toggle(bodyClass, newHiddenState);
      localStorage[storageKey] = newHiddenState;
    });
  };

  activateSidebarToggle(leftSidebar, leftSidebarToggle, "isLeftSidebarHidden", "left-sidebar-is-collapsed");
  activateSidebarToggle(rightSidebar, rightSidebarToggle, "isRightSidebarHidden", "right-sidebar-is-collapsed");
}