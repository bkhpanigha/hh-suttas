export function highlightSegments(startElement, endElement = null, quickHighlight = false) {
    // Remove all previous highlights
    document.querySelectorAll('.highlight').forEach(element => {
        element.classList.remove('highlight');
    });

    // Helper function to parse segment ID into comparable parts
    function parseSegmentId(id) {
        // Updated regex to handle formats like "dn10:0.1" and "dn10:1.1.2"
        const regex = /^([a-z]+\d+):(\d+)(?:\.(\d+))*$/i;
        const match = id.match(regex);
        
        if (!match) return null;
        
        // Convert the full number sequence into an array of numbers
        const numbers = id.split(':')[1].split('.').map(Number);
        
        return {
            prefix: match[1],    // e.g., "dn10"
            numbers: numbers     // e.g., [1, 1, 2] for "dn10:1.1.2"
        };
    }

    // Helper function to compare two segment IDs
    function compareSegmentIds(id1, id2) {
        const parsed1 = parseSegmentId(id1);
        const parsed2 = parseSegmentId(id2);

        if (!parsed1 || !parsed2) return 0;
        
        // First compare the prefix (e.g., "dn10")
        if (parsed1.prefix !== parsed2.prefix) {
            return parsed1.prefix.localeCompare(parsed2.prefix);
        }
        
        // Compare number sequences
        const maxLength = Math.max(parsed1.numbers.length, parsed2.numbers.length);
        for (let i = 0; i < maxLength; i++) {
            const num1 = parsed1.numbers[i] || 0;  // Use 0 if number doesn't exist
            const num2 = parsed2.numbers[i] || 0;
            if (num1 !== num2) {
                return num1 - num2;
            }
        }
        
        return 0;
    }

    // Handle both element and string inputs for start and end
    const getElement = (input) => {
        if (input instanceof Element) return input;
        return document.querySelector(`[id="${input}"]`);
    };

    const start = getElement(startElement);
    const end = getElement(endElement);

    // If it's the single element case (endElement is null), directly highlight it
    if (start && !end) {
        start.classList.add("highlight");

        if (quickHighlight) {
            setTimeout(() => {
                start.classList.remove('highlight');
            }, 2000);
        }
        return;
    }

    // If there's a start and an end (range case)
    if (start && end) {
        const segments = Array.from(document.getElementsByClassName("segment"));
        
        // Sort segments based on their IDs to ensure correct order
        segments.sort((a, b) => compareSegmentIds(a.id, b.id));

        let highlighting = false;
        for (const segment of segments) {
            if (segment === start) {
                highlighting = true;
            }
            
            if (highlighting) {
                segment.classList.add("highlight");
            }
            
            if (segment === end) {
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
