import { highlightSegments } from './highlightSegments.js';

// This code enables highlighting of text segments in the sutta based on URL hash ranges.
// Examples:
// - Single verse: 127.0.0.1:8080/?q=mn1#mn1:23.1
// - Verse range: 127.0.0.1:8080/?q=mn1#mn1:23.1-mn1:194.6
// - Compound verse: 127.0.0.1:8080/?q=mn28#mn28:29-30.1
// - Compound verse range: 127.0.0.1:8080/?q=mn28#mn28:29-30.1-mn28:37.1
// Options:
// - Quick highlight: append ~quick-highlight
// - No highlight: append ~no-highlight

function parseVerseId(verseId) {
    // Match patterns like:
    // mn28:29.1
    // mn28:29-30.1
    const basicPattern = /^(mn\d+):(\d+(?:-\d+)?\.(?:\d+))$/;
    const match = verseId.match(basicPattern);
    
    if (!match) return null;
    return match[1] + ':' + match[2];
}

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
        return;
    }
    
    if (!hash) return;
    
    // Try matching the range pattern first
    // This will match patterns like:
    // mn1:23.1-mn1:194.6
    // mn28:29-30.1-mn28:37.1
    const rangePattern = /^(.+?)-(.+?)$/;
    const rangeMatch = hash.match(rangePattern);
    
    if (rangeMatch) {
        // We have a range
        const [, startId, endId] = rangeMatch;
        
        // Parse both IDs
        const parsedStartId = parseVerseId(startId);
        const parsedEndId = parseVerseId(endId);
        
        if (parsedStartId && parsedEndId) {
            const startElement = document.getElementById(parsedStartId);
            const endElement = document.getElementById(parsedEndId);
            
            if (startElement && endElement) {
                if (!isNoHighlight) {
                    highlightSegments(startElement, endElement, isQuickHighlight);
                }
                startElement.scrollIntoView();
            }
        }
    } else {
        // Handle single element case
        const parsedId = parseVerseId(hash);
        if (parsedId) {
            const targetElement = document.getElementById(parsedId);
            if (targetElement) {
                if (!isNoHighlight) {
                    highlightSegments(targetElement, null, isQuickHighlight);
                }
                targetElement.scrollIntoView();
            }
        }
    }
}
