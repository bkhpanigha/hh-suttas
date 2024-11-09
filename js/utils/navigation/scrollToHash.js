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
        // Enhanced regex pattern to match both normal and composite IDs
        // Examples it will match:
        // - mn1:1.2_mn1:1.5
        // - mn28:29-30.1_mn28:37.1
        // - mn28:28.9_mn28:31-32.1
        const rangeMatch = hash.match(
            /(.*?):(\d+(?:-\d+)?(?:\.\d+)?)(?:_(.*?):(\d+(?:-\d+)?(?:\.\d+)?))?/
        );

        if (rangeMatch) {
            const [, startIdPrefix, startIdSuffix, endIdPrefix, endIdSuffix] = rangeMatch;
            const startFullId = `${startIdPrefix}:${startIdSuffix}`;
            
            // If there's no end range (single element case), use the start ID for both
            const endFullId = endIdPrefix ? 
                `${endIdPrefix}:${endIdSuffix}` : 
                startFullId;
            
            const startElement = document.getElementById(startFullId);
            const endElement = endIdPrefix ? 
                document.getElementById(endFullId) : 
                startElement;

            if (startElement) {
                // If no-highlight is present, skip highlighting
                if (!isNoHighlight) {
                    // If there's no end range, pass null as endElement for single element case
                    highlightSegments(
                        startElement, 
                        endIdPrefix ? endElement : null, 
                        isQuickHighlight
                    );
                }
                startElement.scrollIntoView();
            }
        } else {
            // Handle single element case for both normal and composite IDs
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
