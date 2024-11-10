export function findAllMatches(normalizedText, searchTerms) {
    const matches = [];
    let lastMatchIndex = 0;

    while (true) {
        let bestMatch = -1;
        let bestMatchTerm = null;
        
        for (const term of searchTerms) {
            const matchIndex = normalizedText.indexOf(term, lastMatchIndex);
            if (matchIndex !== -1 && (bestMatch === -1 || matchIndex < bestMatch)) {
                bestMatch = matchIndex;
                bestMatchTerm = term;
            }
        }
        
        if (bestMatch === -1) break;
        
        matches.push({
            start: bestMatch,
            end: bestMatch + bestMatchTerm.length
        });
        
        lastMatchIndex = bestMatch + bestMatchTerm.length;
    }

    return matches;
}