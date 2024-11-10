import { removeDiacritics } from '../misc/removeDiacritics.js';
import { ensureSpaceBeforeClosing } from '../misc/ensureSpaceBeforeClosing.js';
import { getSegmentsBetweenVerses } from '../misc/getSegmentsBetweenVerses.js';
import { extractTextAndTags } from '../misc/extractTextAndTags.js';
import { findAllMatches } from '../misc/findAllMatches.js';
import { reconstructHtmlWithHighlight } from '../misc/reconstructHtmlWithHighlight.js';
import { generateSearchVariants } from '../misc/generateSearchVariants.js';

export function handleVerseSearch(verseRange, searchTerm, isPali) {
    // Get segments
    let segments;
    if (verseRange.includes('_')) {
        segments = getSegmentsBetweenVerses(verseRange);
    } else {
        const segment = document.querySelector(`.segment[id="${verseRange}"]`);
        segments = segment ? [segment] : [];
    }

    if (!segments.length) return;

    segments.forEach(segment => {
        ensureSpaceBeforeClosing(segment);
    });

    const langClass = isPali ? 'pli-lang' : 'eng-lang';
    
    // Extract text and tags from segments
    const segmentsData = segments.map(segment => {
        const langSpan = segment.querySelector(`span.${langClass}`);
        if (!langSpan) return null;

        const originalHtml = langSpan.innerHTML;
        const textAndTags = extractTextAndTags(originalHtml);
        
        if (!textAndTags.plainText.trim()) return null;

        return {
            element: langSpan,
            ...textAndTags,
            id: segment.getAttribute('id'),
            originalText: textAndTags.plainText // Store original text with diacritics
        };
    }).filter(Boolean);

    let combinedText = '';
    const segmentBoundaries = [];

    // Build combined text while preserving original text
    segmentsData.forEach(data => {
        segmentBoundaries.push({
            start: combinedText.length,
            length: data.plainText.length,
            data
        });
        combinedText += data.plainText;
    });

    // Normalize text for search while keeping original
    const normalizeText = text => {
        let normalized = text.toLowerCase();
        // Always remove diacritics for search, regardless of isPali
        return removeDiacritics(normalized);
    };

    const normalizedSearchTerm = normalizeText(searchTerm);
    const normalizedText = normalizeText(combinedText);

    const searchTerms = generateSearchVariants(normalizedSearchTerm);
    const matches = findAllMatches(normalizedText, searchTerms);

    if (!matches.length) return;

    matches.forEach(({ start, end }) => {
        const affectedSegments = segmentBoundaries.filter(boundary => {
            const segmentStart = boundary.start;
            const segmentEnd = boundary.start + boundary.length;
            return (start < segmentEnd && end > segmentStart);
        });

        affectedSegments.forEach(boundary => {
            const { element, plainText, tags } = boundary.data;
            const segmentStart = boundary.start;
            
            const matchStartInSegment = Math.max(0, start - segmentStart);
            const matchEndInSegment = Math.min(boundary.length, end - segmentStart);

            // Use the original text (with diacritics) for display
            element.innerHTML = reconstructHtmlWithHighlight(
                plainText, // Original text with diacritics
                tags,
                matchStartInSegment,
                matchEndInSegment
            );
        });
    });
}