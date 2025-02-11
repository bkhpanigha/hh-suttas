export let isHashScrolling = false;

import { highlightSegments } from './highlightSegments.js';

function scrollWithOffset(element) {
    // Check the available space below the current scroll position
    const spaceBelow = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
	
	//setTimeout to scroll after youtube links are loaded so the position isn't shifted because of it
	setTimeout(() => {
		element.scrollIntoView({ block: "start" });
		/* If there isn't 60px below the current scroll position,
		element.scrollIntoView() above has put the element at the bottom of the page,
		therefore scrolling up would result in hiding it or part of it */
		if (spaceBelow > 60) {
			window.scrollBy(0, -60); // Scroll up by 60px
		} 
	}, 100);
}

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
            scrollWithOffset(commentElement);
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
                scrollWithOffset(startElement);
                setTimeout(() => { isHashScrolling = false; }, 500);
            }
        } else {
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                isHashScrolling = true;
                if (!isNoHighlight) {
                    highlightSegments(targetElement, null, isQuickHighlight);
                }
                scrollWithOffset(targetElement);
                setTimeout(() => { isHashScrolling = false; }, 500);
            }
        }
    }
}
