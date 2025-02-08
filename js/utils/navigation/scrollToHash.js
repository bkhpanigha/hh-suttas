import { highlightSegments } from './highlightSegments.js';

export function scrollToHash() {
    const fullHash = window.location.hash.substring(1); // Remove the '#' from the hash
  
    // Split on `~` to separate the hash part from any options
    const [hash, options] = fullHash.split('~');
  
    // Check for the quick-highlight or no-highlight options in the URL
    const isQuickHighlight = options && options.includes('quick-highlight');
    const isNoHighlight = options && options.includes('no-highlight');
  
    // Remove existing highlights from all comment elements
    document.querySelectorAll(".comment-highlight").forEach(el => el.classList.remove("comment-highlight"));
  
    if (hash.startsWith('comment')) {
        const commentElement = document.getElementById(hash);
        if (commentElement) {
            commentElement.classList.add("comment-highlight");
            commentElement.scrollIntoView({ block: "start" });
            window.scrollBy(0, -60); // Adjusts scroll to be a few lines below
        }
    } else if (hash) {
        // Check if it's a range (contains underscore)
        const isRange = hash.includes('_');
        
        if (isRange) {
            const [startId, endId] = hash.split('_');
            const startElement = document.getElementById(startId);
            const endElement = document.getElementById(endId);
            
            if (startElement) {
                if (!isNoHighlight) {
                    highlightSegments(startElement, endElement, isQuickHighlight);
                }
                startElement.scrollIntoView({ block: "start" });
                window.scrollBy(0, -60);
            }
        } else {
            // Handle single element case
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                if (!isNoHighlight) {
                    highlightSegments(targetElement, null, isQuickHighlight);
                }
                targetElement.scrollIntoView({ block: "start" });
                window.scrollBy(0, -60);
            }
        }
    }
}
