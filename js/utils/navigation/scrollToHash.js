import './highlightSegments.js';

// This code enables highlighting of text segments in the sutta based on URL hash ranges.
// For example, accessing the URL 127.0.0.1:8080/?q=mn1#mn1:23.1-mn1:194.6 will highlight the range from mn1:23.1 to mn1:194.6.
// Similarly, accessing 127.0.0.1:8080/?q=mn1#mn1:23.1 will highlight the single segment at mn1:23.1.
// it also handles cases where there is a need for quick highlighting and no highlighting
// 127.0.0.1:8080/?q=mn1#mn1:23.1-mn1:194.6~quick-highlight and 127.0.0.1:8080/?q=mn1#mn1:23.1-mn1:194.6~no-highlight
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
      // Try matching the range pattern
      const rangeMatch = hash.match(/(.*?):(\d+\.\d+\.\d+|\d+\.\d+)-(.*?):(\d+\.\d+\.\d+|\d+\.\d+)/);
      if (rangeMatch) {
        const [, startIdPrefix, startIdSuffix, endIdPrefix, endIdSuffix] = rangeMatch;
        const startFullId = `${startIdPrefix}:${startIdSuffix}`;
        const endFullId = `${endIdPrefix}:${endIdSuffix}`;
        const startElement = document.getElementById(startFullId);
        const endElement = document.getElementById(endFullId);
  
        if (startElement && endElement) {
          // If no-highlight is present, skip highlighting
          if (!isNoHighlight) {
            highlightSegments(startElement, endElement, isQuickHighlight);
          }
          startElement.scrollIntoView();
        }
      } else {
        // Handle single element case using the same highlightSegments function
        const targetElement = document.getElementById(hash);
        if (targetElement) {
          if (!isNoHighlight) {
            highlightSegments(targetElement, null, isQuickHighlight); // Treat single element case
          }
          targetElement.scrollIntoView(); // Directly scroll to the single target element
        }
      }
    }
  }