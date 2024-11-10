import { highlightSegments } from './highlightSegments.js';

export function scrollToHash() {
    const fullHash = window.location.hash.substring(1); // Remove the '#' from the hash
  
    // Split on `~` to separate the hash part from any options
    const [hash, options] = fullHash.split('~');
  
    // Check for the quick-highlight or no-highlight options in the URL
    const isQuickHighlight = options && options.includes('quick-highlight');
    const isNoHighlight = options && options.includes('no-highlight');
  
    if (hash.startsWith('comment')) {
        const commentElement = document.getElementById(hash);
        if (commentElement) {
            commentElement.classList.add("comment-highlight");
            commentElement.scrollIntoView();
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
                startElement.scrollIntoView();
            }
        } else {
            // Handle single element case
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                if (!isNoHighlight) {
                    highlightSegments(targetElement, null, isQuickHighlight);
                }
                targetElement.scrollIntoView();
            }
        }
    }
}
