export function handleSidebarToggles() {
    const leftToggle = document.getElementById('left-sidebar-toggle');
    const rightToggle = document.getElementById('right-sidebar-toggle');
    const leftSidebar = document.getElementById('left-sidebar');
    const rightSidebar = document.getElementById('right-sidebar');
    const suttaContent = document.getElementById('sutta');

    if (!suttaContent) {
        // The sutta content might not be present on all pages (e.g. home page).
        // So we just return silently.
        return;
    }

    // Function to update sutta margins based on sidebar visibility
    const updateSuttaMargins = () => {
        // Remove existing margin classes to reset before re-evaluating
        suttaContent.classList.remove('sutta-margin-left-expanded', 'sutta-margin-right-expanded');

        // Check left sidebar visibility
        if (leftSidebar) {
            // Check if the sidebar is effectively hidden (either display:none or zero width)
            const isLeftSidebarHidden = window.getComputedStyle(leftSidebar).display === 'none' || leftSidebar.offsetWidth === 0;
            if (isLeftSidebarHidden) {
                suttaContent.classList.add('sutta-margin-left-expanded');
            }
        }

        // Check right sidebar visibility
        if (rightSidebar) {
            // Check if the sidebar is effectively hidden (either display:none or zero width)
            const isRightSidebarHidden = window.getComputedStyle(rightSidebar).display === 'none' || rightSidebar.offsetWidth === 0;
            if (isRightSidebarHidden) {
                suttaContent.classList.add('sutta-margin-right-expanded');
            }
        }
    };

    // Apply initial margins on page load
    updateSuttaMargins();

    // Add event listeners to toggle buttons
    if (leftToggle) {
        leftToggle.addEventListener('click', () => {
            // Use a small timeout to allow the sidebar's CSS transition to complete
            // before re-evaluating the sutta content's margins.
            setTimeout(updateSuttaMargins, 50);
        });
    }

    if (rightToggle) {
        rightToggle.addEventListener('click', () => {
            setTimeout(updateSuttaMargins, 50);
        });
    }
}