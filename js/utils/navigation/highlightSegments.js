export function highlightSegments(startElement, endElement = null, quickHighlight = false) 
{
    // Remove all previous highlights
    document.querySelectorAll('.highlight').forEach(element => {
        element.classList.remove('highlight');
    });

    // If it's the single element case (endElement is null), directly highlight it
    if (startElement && !endElement) {
        startElement.classList.add("highlight");

        if (quickHighlight) {
        setTimeout(() => {
            startElement.classList.remove('highlight'); // Remove highlight after transition
        }, 2000); // Adjust the quick highlight duration (in ms) as needed
        }
        return; // No need to loop or do anything else for the single element case
    }

    // If there's a startElement and an endElement (range case)
    if (startElement && endElement) {
        let highlight = false;
        const segments = document.getElementsByClassName("segment");

        for (const segment of segments) {
        if (segment.id === startElement.id) {
            highlight = true;
        }

        if (highlight) {
            segment.classList.add("highlight");
        }

        // Stop highlighting when we reach the end element
        if (segment.id === endElement.id) {
            break;
        }
        }

        // If quick highlight is enabled, smoothly de-highlight after a short duration
        if (quickHighlight) {
        setTimeout(() => {
            document.querySelectorAll('.highlight').forEach(element => {
            element.classList.remove('highlight'); // Let the transition handle smooth de-highlight
            });
        }, 2000); // Adjust the quick highlight duration (in ms) as needed
        }
    }
}