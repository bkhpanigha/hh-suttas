// Utilities for parsing verse IDs
const parseVerseId = (verseId) => {
    // Format: bookNum.section-subsection:verse.subverse
    const regex = /^([a-z]+)(\d*)((?:\.\d+)*)?(?:-(\d+(?:\.\d+)*))?(:\d+(?:\.\d+)*)?$/i;
    const match = verseId.match(regex);
    
    if (!match) return null;
    
    const [_, book, mainNum, sections, subsections, verse] = match;
    
    return {
        book: book.toLowerCase(),
        mainNum: mainNum || '',
        sections: sections ? sections.slice(1).split('.').map(Number) : [],
        subsections: subsections ? subsections.split('.').map(Number) : [],
        verse: verse ? verse.slice(1).split('.').map(Number) : []
    };
};

// Compare two verse IDs to determine their order
const compareVerseIds = (id1, id2) => {
    const v1 = parseVerseId(id1);
    const v2 = parseVerseId(id2);
    
    if (!v1 || !v2) return 0;
    
    // Compare the book
    if (v1.book < v2.book) return -1;
    if (v1.book > v2.book) return 1;
    
    // Compare the main number
    const num1 = parseInt(v1.mainNum) || 0;
    const num2 = parseInt(v2.mainNum) || 0;
    if (num1 !== num2) return num1 - num2;
    
    // Compare sections
    for (let i = 0; i < Math.max(v1.sections.length, v2.sections.length); i++) {
        const s1 = v1.sections[i] || 0;
        const s2 = v2.sections[i] || 0;
        if (s1 !== s2) return s1 - s2;
    }
    
    // Compare subsections
    for (let i = 0; i < Math.max(v1.subsections.length, v2.subsections.length); i++) {
        const s1 = v1.subsections[i] || 0;
        const s2 = v2.subsections[i] || 0;
        if (s1 !== s2) return s1 - s2;
    }
    
    // Compare verse numbers
    for (let i = 0; i < Math.max(v1.verse.length, v2.verse.length); i++) {
        const ver1 = v1.verse[i] || 0;
        const ver2 = v2.verse[i] || 0;
        if (ver1 !== ver2) return ver1 - ver2;
    }
    
    return 0;
};

// Check if a verse is between two other verses
const isVerseBetween = (verseId, startVerse, endVerse) => {
    return compareVerseIds(startVerse, verseId) <= 0 && 
           compareVerseIds(verseId, endVerse) <= 0;
};

// Normalize the end verse if it's incomplete
const normalizeVerseEnd = (startVerse, endVerse) => {
    if (!endVerse) return startVerse;
    
    const startParsed = parseVerseId(startVerse);
    const endParsed = parseVerseId(endVerse);
    
    if (!startParsed || !endParsed) return endVerse;
    
    // If the end has no specified book, use the one from the start
    if (!endParsed.book) {
        endVerse = startParsed.book + endVerse;
    }
    
    return endVerse;
};

export function getSegmentsBetweenVerses(verseRange) {
    // Handle case where there is no range (a single verse)
    if (!verseRange.includes('_')) {
        const segments = Array.from(document.querySelectorAll('.segment'));
        return segments.filter(segment => {
            const id = segment.getAttribute('id');
            return id && id === verseRange;
        });
    }
    
    const [startVerse, endVerse] = verseRange.split('_');
    const normalizedEndVerse = normalizeVerseEnd(startVerse, endVerse);
    
    // Parse start and end verses
    const startParsed = parseVerseId(startVerse);
    const endParsed = parseVerseId(normalizedEndVerse);
    
    if (!startParsed || !endParsed) {
        console.error('Invalid verse range format:', verseRange);
        return [];
    }
    
    // Get all segments and filter them based on verse range
    return Array.from(document.querySelectorAll('.segment'))
        .filter(segment => {
            const id = segment.getAttribute('id');
            if (!id) return false;
            return isVerseBetween(id, startVerse, normalizedEndVerse);
        });
}
