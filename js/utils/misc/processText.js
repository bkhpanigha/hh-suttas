import { removeDiacritics } from './removeDiacritics.js';
import { normalizeSpaces } from './normalizeSpaces.js';

export const processText = (text, pali) => {
    let processed = normalizeSpaces(text);
    if (pali) {
        processed = removeDiacritics(processed);
    }
    return processed;
};