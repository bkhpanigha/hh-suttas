import { applyHighlight } from './applyHighlight.js';

export function reconstructHtmlWithHighlight(text, tags, highlightStart, highlightEnd) {
    let result = '';
    let currentPos = 0;

    tags.forEach(tag => {
        if (tag.start > currentPos) {
            result += applyHighlight(
                text.slice(currentPos, tag.start),
                Math.max(0, highlightStart - currentPos),
                Math.min(tag.start - currentPos, highlightEnd - currentPos)
            );
        }

        if (tag.type === 'a') {
            result += tag.tag;
        } else if (tag.type === 'em') {
            const emContent = text.slice(tag.start, tag.end);
            const emHighlightStart = Math.max(0, highlightStart - tag.start);
            const emHighlightEnd = Math.min(tag.end - tag.start, highlightEnd - tag.start);
            
            if (emHighlightStart < emContent.length && emHighlightEnd > 0) {
                result += '<em>' + applyHighlight(
                    emContent,
                    emHighlightStart,
                    emHighlightEnd
                ) + '</em>';
            } else {
                result += '<em>' + emContent + '</em>';
            }
        }

        currentPos = tag.end;
    });

    if (currentPos < text.length) {
        result += applyHighlight(
            text.slice(currentPos),
            Math.max(0, highlightStart - currentPos),
            Math.min(text.length - currentPos, highlightEnd - currentPos)
        );
    }

    return result;
}