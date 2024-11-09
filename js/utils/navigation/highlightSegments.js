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

    // Helper function to parse segment ID into comparable parts
    function parseSegmentId(id) {
        // Updated regex to handle formats like "sn1.20:4.1" and "mn28:29-30.1"
        // Matches: prefix (including dots) : chapter (-optional verse) . subdivision
        const regex = /^([a-z]+\d+(?:\.\d+)?):(\d+)(?:-(\d+))?\.(\d+)$/i;
        const match = id.match(regex);
        
        if (!match) return null;
        
        return {
            prefix: match[1],        // e.g., "sn1.20" or "mn28"
            chapter: parseInt(match[2]),
            verse: match[3] ? parseInt(match[3]) : parseInt(match[2]), // If no verse (after -), use chapter
            subdivision: parseInt(match[4])
        };
    }

    // Helper function to compare two segment IDs
    function compareSegmentIds(id1, id2) {
        const parsed1 = parseSegmentId(id1);
        const parsed2 = parseSegmentId(id2);

        if (!parsed1 || !parsed2) return 0;
        
        // First compare the complete prefix (e.g., "sn1.20")
        if (parsed1.prefix !== parsed2.prefix) {
            return parsed1.prefix.localeCompare(parsed2.prefix);
        }
        
        // Then compare chapter numbers
        if (parsed1.chapter !== parsed2.chapter) {
            return parsed1.chapter - parsed2.chapter;
        }
        
        // Then compare verse numbers
        if (parsed1.verse !== parsed2.verse) {
            return parsed1.verse - parsed2.verse;
        }
        
        // Finally compare subdivisions
        return parsed1.subdivision - parsed2.subdivision;
    }

    // If there's a startElement and an endElement (range case)
    if (startElement && endElement) {
        let highlight = false;
        const segments = Array.from(document.getElementsByClassName("segment"));
        
        // Sort segments based on their IDs to ensure correct order
        segments.sort((a, b) => compareSegmentIds(a.id, b.id));

        for (const segment of segments) {
            // Compare current segment with start and end elements
            const currentCompare = compareSegmentIds(segment.id, startElement.id);
            const endCompare = compareSegmentIds(segment.id, endElement.id);
            
            // Only highlight if segment is within range (inclusive)
            if (currentCompare >= 0 && endCompare <= 0) {
                segment.classList.add("highlight");
            }

            // Stop when we've passed the end element
            if (endCompare > 0) {
                break;
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
