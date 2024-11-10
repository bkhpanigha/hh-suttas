import { removeDiacritics } from '../misc/removeDiacritics.js';
import { processNode } from '../misc/processNode.js';
import { wrapWithTags } from '../misc/wrapWithTags.js';
import { generateSearchVariants } from '../misc/generateSearchVariants.js';

export function handleCommentSearch(commentId, searchTerm) {
    const commentElement = document.getElementById(commentId);
    if (!commentElement) return;

    const normalizeText = text => removeDiacritics(text.toLowerCase());
    
    const workingElement = commentElement.cloneNode(true);
    
    const endLinks = Array.from(workingElement.querySelectorAll('a'))
        .filter(a => a.textContent === '←')
        .map(a => a.outerHTML);
        
    endLinks.forEach(link => {
        workingElement.innerHTML = workingElement.innerHTML.replace(link, '');
    });
    
    const textParts = [];
    const currentText = processNode(workingElement, textParts);
    
    const normalizedSearchTerm = normalizeText(searchTerm);
    const normalizedText = normalizeText(currentText);
    
    const searchTerms = generateSearchVariants(normalizedSearchTerm);
    
    const matches = [];
    let lastEnd = 0;
    
    while (true) {
        let bestMatch = -1;
        let bestMatchTerm = null;
        
        for (const term of searchTerms) {
            const matchIndex = normalizedText.indexOf(term, lastEnd);
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
        
        lastEnd = bestMatch + bestMatchTerm.length;
    }
    
    if (matches.length === 0) return;
    
    let result = '';
    let currentPos = 0;
    
    for (const part of textParts) {
        let partResult = '';
        let partStart = part.start;
        let partEnd = part.start + part.length;
        
        let hasMatch = false;
        for (const match of matches) {
            if (partEnd > match.start && partStart < match.end) {
                hasMatch = true;
                
                if (part.type === 'a') {
                    const linkText = part.text;
                    const matchStartInLink = Math.max(0, match.start - partStart);
                    const matchEndInLink = Math.min(part.length, match.end - partStart);
                    
                    const beforeMatch = linkText.substring(0, matchStartInLink);
                    const matchedText = linkText.substring(matchStartInLink, matchEndInLink);
                    const afterMatch = linkText.substring(matchEndInLink);
                    
                    partResult = `<a href="${part.href}">${beforeMatch}<span class="searchTerm">${matchedText}</span>${afterMatch}</a>`;
                } else {
                    const highlightStart = Math.max(0, match.start - partStart);
                    const highlightEnd = Math.min(part.length, match.end - partStart);
                    
                    let text = part.text;
                    if (highlightStart > 0) {
                        text = text.slice(0, highlightStart) +
                              '<span class="searchTerm">' +
                              text.slice(highlightStart, highlightEnd) +
                              '</span>' +
                              text.slice(highlightEnd);
                    } else {
                        text = '<span class="searchTerm">' +
                              text.slice(highlightStart, highlightEnd) +
                              '</span>' +
                              text.slice(highlightEnd);
                    }
                    
                    if (part.parentTags && part.parentTags.length > 0) {
                        partResult = wrapWithTags(text, part.parentTags);
                    } else {
                        partResult = text;
                    }
                }
                break;
            }
        }
        
        if (!hasMatch) {
            if (part.type === 'a') {
                partResult = part.html;
            } else if (part.parentTags && part.parentTags.length > 0) {
                partResult = wrapWithTags(part.text, part.parentTags);
            } else {
                partResult = part.text;
            }
        }
        
        result += partResult;
    }
    
    result += '\n                ' + endLinks.join('\n                ') + '\n                ';
    
    commentElement.querySelector('span').innerHTML = result;
}