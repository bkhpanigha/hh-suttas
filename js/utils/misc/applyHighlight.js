export function applyHighlight(text, highlightStart, highlightEnd) {
    if (highlightStart >= text.length || highlightEnd <= 0) {
        return text;
    }

    highlightStart = Math.max(0, highlightStart);
    highlightEnd = Math.min(text.length, highlightEnd);

    if (highlightStart >= highlightEnd) {
        return text;
    }

    return text.slice(0, highlightStart) +
           '<span class="searchTerm">' +
           text.slice(highlightStart, highlightEnd) +
           '</span>' +
           text.slice(highlightEnd);
}