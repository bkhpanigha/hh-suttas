import { cleanVerse } from '../misc/cleanVerse.js';

export const getFirstPassage = (content, wordCount) => {
    let text = '';
    let totalWords = 0;
    
    for (const verse of Object.values(content)) {
        const cleanedVerse = cleanVerse(verse);
        const words = cleanedVerse.split(/\s+/);
        
        if (totalWords + words.length <= wordCount) {
            text += cleanedVerse + ' ';
            totalWords += words.length;
        } else {
            const remainingWords = wordCount - totalWords;
            text += words.slice(0, remainingWords).join(' ');
            text += ' [...]';
            break;
        }
    }
    
    return text.trim();
};
