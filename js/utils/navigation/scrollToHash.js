export let isHashScrolling = false;

import { highlightSegments } from './highlightSegments.js';

export function scrollToHash() {
    const fullHash = window.location.hash.substring(1);
    const [hash, options] = fullHash.split('~');

    const isQuickHighlight = options && options.includes('quick-highlight');
    const isNoHighlight = options && options.includes('no-highlight');

    document.querySelectorAll(".comment-highlight").forEach(el => el.classList.remove("comment-highlight"));

    if (hash.startsWith('comment')) {
        const commentElement = document.getElementById(hash);
        if (commentElement) {
            isHashScrolling = true;
            commentElement.classList.add("comment-highlight");
            commentElement.scrollIntoView({ block: "start" });
            window.scrollBy(0, -60);
            setTimeout(() => { isHashScrolling = false; }, 500);
        }
    } else if (hash) {
        const isRange = hash.includes('_');

        if (isRange) {
            const [startId, endId] = hash.split('_');
            const startElement = document.getElementById(startId);
            const endElement = document.getElementById(endId);

            if (startElement) {
                isHashScrolling = true;
                if (!isNoHighlight) {
                    highlightSegments(startElement, endElement, isQuickHighlight);
                }
                startElement.scrollIntoView({ block: "start" });
                window.scrollBy(0, -60);
                setTimeout(() => { isHashScrolling = false; }, 500);
            }
        } else {
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                isHashScrolling = true;
                if (!isNoHighlight) {
                    highlightSegments(targetElement, null, isQuickHighlight);
                }
                targetElement.scrollIntoView({ block: "start" });
                window.scrollBy(0, -60);
                setTimeout(() => { isHashScrolling = false; }, 500);
            }
        }
    }
}
