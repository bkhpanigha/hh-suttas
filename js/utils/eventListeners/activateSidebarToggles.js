import getDocumentAreas from "../getDocumentAreas.js";

export default function activateSidebarToggles() {
  const { leftSidebar, leftSidebarToggle, rightSidebar, rightSidebarToggle } = getDocumentAreas();
  if (!leftSidebar || !leftSidebarToggle || !rightSidebar || !rightSidebarToggle) return;

  const activateSidebarToggle = (sidebar, toggle, storageKey) => {
    const isHidden = localStorage[storageKey] === "true";
    sidebar.classList.toggle("collapsed", isHidden);

    toggle.addEventListener("click", () => {
      const currentlyHidden = localStorage[storageKey] === "true";
      sidebar.classList.toggle("collapsed", !currentlyHidden);
      localStorage[storageKey] = !currentlyHidden;
    });
  };

  activateSidebarToggle(leftSidebar, leftSidebarToggle, "isLeftSidebarHidden");
  activateSidebarToggle(rightSidebar, rightSidebarToggle, "isRightSidebarHidden");
}