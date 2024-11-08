// Helper function to parse segment IDs into comparable parts
function parseSegmentId(id) {
    // Format expected: mnXX:YY.Z or mnXX:YY-ZZ.W
    const match = id.match(/^mn(\d+):(\d+)(?:-(\d+))?\.(\d+)$/);
    if (!match) return null;
    
    const [_, sutra, startVerse, endVerse, subVerse] = match;
    return {
        sutra: parseInt(sutra),
        startVerse: parseInt(startVerse),
        endVerse: endVerse ? parseInt(endVerse) : parseInt(startVerse),
        subVerse: parseInt(subVerse)
    };
}

// Helper function to compare two segment positions
function compareSegmentPositions(id1, id2) {
    const pos1 = parseSegmentId(id1);
    const pos2 = parseSegmentId(id2);
    
    if (!pos1 || !pos2) return 0;
    
    // Compare sutra numbers
    if (pos1.sutra !== pos2.sutra) {
        return pos1.sutra - pos2.sutra;
    }
    
    // Compare verses
    if (pos1.startVerse !== pos2.startVerse) {
        return pos1.startVerse - pos2.startVerse;
    }
    
    // If one has an endVerse and the other doesn't, compare appropriately
    if (pos1.endVerse !== pos2.endVerse) {
        return pos1.endVerse - pos2.endVerse;
    }
    
    // Compare subverses
    return pos1.subVerse - pos2.subVerse;
}

// Helper function to check if a segment is within range
function isSegmentInRange(currentId, startId, endId) {
    const compareStart = compareSegmentPositions(currentId, startId);
    const compareEnd = compareSegmentPositions(currentId, endId);
    
    // If current segment is equal to or after start, and equal to or before end
    return compareStart >= 0 && compareEnd <= 0;
}

export function highlightSegments(startElement, endElement = null, quickHighlight = false) {
    // Remove all previous highlights
    document.querySelectorAll('.highlight').forEach(element => {
        element.classList.remove('highlight');
    });

    // If it's the single element case (endElement is null), directly highlight it
    if (startElement && !endElement) {
        startElement.classList.add("highlight");
        
        if (quickHighlight) {
            setTimeout(() => {
                startElement.classList.remove('highlight');
            }, 2000);
        }
        return;
    }

    // If there's a startElement and an endElement (range case)
    if (startElement && endElement) {
        const startId = startElement.id;
        const endId = endElement.id;
        const segments = document.getElementsByClassName("segment");

        for (const segment of segments) {
            if (isSegmentInRange(segment.id, startId, endId)) {
                segment.classList.add("highlight");
            }
        }

        if (quickHighlight) {
            setTimeout(() => {
                document.querySelectorAll('.highlight').forEach(element => {
                    element.classList.remove('highlight');
                });
            }, 2000);
        }
    }
}
