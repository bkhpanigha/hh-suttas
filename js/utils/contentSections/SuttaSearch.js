
import { removeDiacritics } from '../misc/removeDiacritics.js';
import { cleanVerse } from '../misc/cleanVerse.js';
import { escapeRegExp } from '../misc/escapeRegExp.js';
import { normalizeSpaces } from '../misc/normalizeSpaces.js';

// Main search class for better data organization and caching
class SuttaSearch {
    constructor(textData, pali = false) {
        this.originalText = textData;
        this.pali = pali;
        this.verseKeys = Object.keys(textData);
        this.fullText = '';
        this.processedText = '';
        this.versePositions = new Map();
        this.commentNumbers = new Map();
        this.positionMap = new Map();
        this.cleanedVerses = new Map();
        this.initialize();
    }

    initialize() {
        let currentPosition = 0;
        this.fullText = '';
        let commentCount = 0;
        let lastCommentNumber = 0;
		
        // Pre-clean and store verses
        for (const key of this.verseKeys) {
            const verse = this.originalText[key];
            // Remove markdown formatting but keep original text with diacritics
            const cleanedVerse = this.cleanMarkdownOnly(verse);
            this.cleanedVerses.set(key, cleanedVerse);

            if (verse.trim() !== '') {
                commentCount++;
                lastCommentNumber = commentCount;
            }
            this.versePositions.set(currentPosition, key);
            this.commentNumbers.set(key, lastCommentNumber);
            this.fullText += this.cleanedVerses.get(key);
            currentPosition += this.cleanedVerses.get(key).length;
        }

        // Create normalized version of full text for searching
        this.processedText = this.normalizeText(this.fullText);
        
        // Map positions between original and normalized text
        let originalIndex = 0;
        let normalizedIndex = 0;
        const normalizedFullText = this.processedText;
        
        while (normalizedIndex < normalizedFullText.length) {
            while (originalIndex < this.fullText.length) {
                const originalChar = this.fullText[originalIndex];
                const normalizedChar = normalizedFullText[normalizedIndex];
                
                if (this.compareChars(originalChar, normalizedChar)) {
                    this.positionMap.set(normalizedIndex, originalIndex);
                    normalizedIndex++;
                    originalIndex++;
                    break;
                }
                originalIndex++;
            }
        }
    }

    // Compare characters accounting for diacritics
    compareChars(original, normalized) {
        return original === normalized || 
               removeDiacritics(original) === normalized ||
               normalized === ' ' && /[\s\u00A0]|&nbsp;/.test(original);
    }

    // Clean markdown formatting but preserve diacritics
    cleanMarkdownOnly(text) {
        // Remove markdown formatting and em tags
        text = text
            .replace(/[_*]([^_*]+)[_*]/g, '$1')  // Remove _text_ and *text*
            .replace(/<em>([^<]+)<\/em>/g, '$1')  // Remove <em>text</em>
            // Clean markdown links
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        return text;
    }

    // Normalize text for searching (remove diacritics and clean spacing)
    normalizeText(text) {
        text = removeDiacritics(text);
        return text.replace(/\u00A0/g, ' ')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
    }
	
	getCommentNumber(verse) {
        return this.commentNumbers.get(verse) || 0;
    }

    findVerseRange(startPos, endPos) {
        let startVerse = null;
        let endVerse = null;
        let lastPosition = -1;
        
        for (const [pos, key] of this.versePositions.entries()) {
            if (pos <= startPos) {
                startVerse = key;
            }
            if (pos <= endPos) {
                endVerse = key;
                lastPosition = pos;
            } else {
                break;
            }
        }
        
        // If endPos extends into the next verse after lastPosition
        if (lastPosition >= 0 && lastPosition + this.originalText[endVerse].length > endPos) {
            endVerse = this.verseKeys[this.verseKeys.indexOf(endVerse)];
        }
        
        return `${startVerse}_${endVerse}`;
    }
	
    getPassage(startPos, endPos, matchStart, matchEnd, isComment = false) {
		// Ensure passage includes the entire match
		startPos = Math.min(startPos, matchStart);
		endPos = Math.max(endPos, matchEnd);

		// Adjust to text boundaries
		startPos = Math.max(0, startPos);
		endPos = Math.min(this.fullText.length, endPos);

		// Find initial word boundaries
		let passageStart = this.findWordBoundary(this.fullText, startPos, 'backward');
		let passageEnd = this.findWordBoundary(this.fullText, endPos, 'forward');

		// Determine if this passage covers the start or end of the full text
		const isStartOfText = passageStart === 0;
		const isEndOfText = passageEnd >= this.fullText.length - 1; // Allow for minor whitespace discrepancies

		// For comments, ensure we stay within verse boundaries
		if (isComment) {
			// Find the verse that contains the start position
			let currentVerseStart = 0;
			let currentVerseKey = '';

			for (const [pos, key] of this.versePositions.entries()) {
				if (pos <= startPos) {
					currentVerseStart = pos;
					currentVerseKey = key;
				} else {
					break;
				}
			}

			const currentVerseText = this.cleanedVerses.get(currentVerseKey);
			const currentVerseEnd = currentVerseStart + currentVerseText.length;

			// Check if the entire verse content is being displayed
			const isEntireVerseDisplayed = 
				passageStart <= currentVerseStart && 
				passageEnd >= currentVerseEnd;

			// Ensure we include the full match
			passageStart = Math.min(passageStart, matchStart);
			passageEnd = Math.max(passageEnd, matchEnd);

			// Then adjust to word boundaries within the verse
			if (passageStart < currentVerseStart) {
				passageStart = currentVerseStart;
			}
			if (passageEnd > currentVerseEnd) {
				passageEnd = currentVerseEnd;
			}
		}

		// Ensure we have valid passage boundaries
		if (passageEnd <= passageStart) {
			passageEnd = matchEnd + 1;  // Ensure we at least include the match
		}

		let passage = this.fullText.substring(passageStart, passageEnd);

		// If passage is empty or only whitespace, expand it
		if (!passage.trim()) {
			passageStart = Math.max(0, matchStart - 50);  // Take 50 chars before match
			passageEnd = Math.min(this.fullText.length, matchEnd + 50);  // and 50 after
			passage = this.fullText.substring(passageStart, passageEnd);
		}

		// Handle ellipses for comments
		let prefix = '';
		let suffix = '';
		if (isComment) {
			let currentVerseStart = 0;
			let currentVerseKey = '';

			for (const [pos, key] of this.versePositions.entries()) {
				if (pos <= startPos) {
					currentVerseStart = pos;
					currentVerseKey = key;
				} else {
					break;
				}
			}

			const currentVerseText = this.cleanedVerses.get(currentVerseKey);
			const currentVerseEnd = currentVerseStart + currentVerseText.length;

			// Precise checks for additional text
			const hasTextBefore = currentVerseStart < passageStart;
			const hasTextAfter = currentVerseEnd > passageEnd;

			prefix = hasTextBefore ? '[...] ' : '';
			suffix = hasTextAfter ? ' [...]' : '';
		} else {
			prefix = isStartOfText ? '' : '[...] ';
			suffix = isEndOfText ? '' : ' [...]';
		}

		// Adjust match positions relative to passage
		const relativeMatchStart = matchStart - passageStart;
		const relativeMatchEnd = matchEnd - passageStart;

		// Split passage into three parts and add highlighting
		const beforeMatch = passage.substring(0, relativeMatchStart);
		const match = passage.substring(relativeMatchStart, relativeMatchEnd);
		const afterMatch = passage.substring(relativeMatchEnd);

		passage = prefix + beforeMatch + '<b>' + match + '</b>' + afterMatch + suffix;

		// Clean verse if in comment mode
		if (isComment) {
			passage = cleanVerse(passage);
		}

		return passage;
	}

    findWordBoundary(text, position, direction = 'forward') {
		// Define characters that can be attached to a word
		const attachedPunctuation = /[.,!?;"“”'`)\]}\-—_:/]/;
		const wordBoundaryRegex = /\s/;

		if (direction === 'forward') {
			let pos = position;
			// Move forward until we find a whitespace
			while (pos < text.length && !wordBoundaryRegex.test(text[pos])) {
				pos++;
			}
			return pos;
		} else {
			// Find the beginning of the word, ignoring attached punctuation
			let pos = position;
			// Move backward while we are on punctuation
			while (pos > 0 && attachedPunctuation.test(text[pos - 1])) {
				pos--;
			}
			// Then move backward until a whitespace is found
			while (pos > 0 && !wordBoundaryRegex.test(text[pos - 1])) {
				pos--;
			}
			return pos;
		}
	}
	
	async findMatches(searchTerm, strict = false, isComment = false, singleResult = false, maxWords, resultCallback) {
		// Create search term variations
		let searchTerms = new Set();
		
		// Initial cleanup of the search term
		searchTerm = searchTerm.trim();
		
		// Add the original term
		searchTerms.add(searchTerm);
		
		// Handle apostrophes
		if (searchTerm.includes('’') || searchTerm.includes('\'')) {
			searchTerms.add(searchTerm.replace(/'/g, '’'));
			searchTerms.add(searchTerm.replace(/'/g, '\''));
		}
		
		// Handle ellipses - different possible variants
		const ellipsisVariants = ['...', '…', ' ...', ' …', '... ', '… '];
		
		// For each existing term, create variants with different types of ellipses
		let currentTerms = Array.from(searchTerms);
		for (let term of currentTerms) {
			for (let variant of ellipsisVariants) {
				// If the term contains one of the ellipsis variants
				if (term.includes('...') || term.includes('…')) {
					// Create variants by replacing with each possible type
					ellipsisVariants.forEach(ellipsis => {
						searchTerms.add(term.replace(/\.{3}|…/g, ellipsis));
					});
				}
			}
		}

		const results = [];
		const seenResults = new Set();
		
		for (let term of searchTerms) {
			// Normalize the search term
			const normalizedSearchTerm = this.normalizeText(term);

			let searchPattern;
			if (strict) {
				searchPattern = '(?<=^|\\s)' + escapeRegExp(normalizedSearchTerm.trim()) + '(?=$|\\s|[.,!?;"""\'`’()\\]}:/—_-])';
			} else {
				searchPattern = escapeRegExp(normalizedSearchTerm.trim());
			}

			const regex = new RegExp(searchPattern, 'gi');
			let match;

			while ((match = regex.exec(this.processedText)) !== null) {
				const matchStart = match.index;
				const matchEnd = matchStart + match[0].length;

				const originalMatch = this.findOriginalTextMatch(matchStart, matchEnd);
				if (!originalMatch) continue;

				let result;
				const searchTermWords = normalizedSearchTerm.trim().split(/\s+/);
				const searchTermLength = searchTermWords.length;

				// Check if match is near the end of the text
				const isNearEnd = this.fullText.length - originalMatch.end < Math.max(100, this.fullText.length * 0.05);
				
				if (isComment) {
					let verseKey = '';
					let verseStart = 0;

					for (const [pos, key] of this.versePositions.entries()) {
						if (pos <= originalMatch.start) {
							verseKey = key;
							verseStart = pos;
						}
					}

					const verseText = this.cleanedVerses.get(verseKey);
					const verseEnd = verseStart + verseText.length;

					if (isNearEnd) {
						// Return entire end of text if near the end
						const startWord = Math.max(0, verseText.split(/\s+/).length - maxWords);
						const passageStart = verseStart + verseText.split(/\s+/).slice(0, startWord).join(' ').length + (startWord > 0 ? 1 : 0);
						const passageEnd = verseStart + verseText.length;

						result = {
							passage: this.getPassage(passageStart, passageEnd, originalMatch.start, originalMatch.end, true),
							commentNb: this.getCommentNumber(verseKey)
						};
					} else if (verseText.split(/\s+/).length > maxWords) {
						const verseOffset = originalMatch.start - verseStart;
						const words = verseText.split(/\s+/);
						const matchWordIndex = verseText.substring(0, verseOffset).split(/\s+/).length;

						const targetWordsBeforeMatch = Math.floor((maxWords - searchTermWords.length) / 2);
						let startWord = Math.max(0, matchWordIndex - targetWordsBeforeMatch);
						let endWord = Math.min(words.length, startWord + maxWords);

						if (startWord + maxWords > words.length) {
							startWord = Math.max(0, words.length - maxWords);
							endWord = words.length;
						}

						const passageStart = verseStart + words.slice(0, startWord).join(' ').length + (startWord > 0 ? 1 : 0);
						const passageEnd = verseStart + words.slice(0, endWord).join(' ').length;

						result = {
							passage: this.getPassage(passageStart, passageEnd, originalMatch.start, originalMatch.end, true),
							commentNb: this.getCommentNumber(verseKey)
						};
					} else {
						result = {
							passage: this.getPassage(verseStart, verseEnd, originalMatch.start, originalMatch.end, true),
							commentNb: this.getCommentNumber(verseKey)
						};
					}
				} else {
					const words = this.fullText.split(/\s+/);
					const totalWords = words.length;

					if (isNearEnd) {
						// Return entire end of text if near the end
						const startWord = Math.max(0, totalWords - maxWords);
						const passageStart = words.slice(0, startWord).join(' ').length;
						const passageEnd = this.fullText.length;

						result = {
							passage: this.getPassage(passageStart, passageEnd, originalMatch.start, originalMatch.end),
							verseRange: this.findVerseRange(passageStart, passageEnd)
						};
					} else if (searchTermLength > maxWords) {
						const passageStart = this.findWordBoundary(this.fullText, originalMatch.start, 'backward');
						const passageEnd = this.findWordBoundary(this.fullText, originalMatch.end, 'forward');

						result = {
							passage: this.getPassage(passageStart, passageEnd, originalMatch.start, originalMatch.end),
							verseRange: this.findVerseRange(passageStart, passageEnd)
						};
					} else {
						const matchWordPosition = this.fullText.substring(0, originalMatch.start).split(/\s+/).length;
						const matchLength = searchTermWords.length;

						const targetWordsBeforeMatch = Math.floor((maxWords - matchLength) / 2);
						let startWord = Math.max(0, matchWordPosition - targetWordsBeforeMatch);
						let endWord = Math.min(totalWords, startWord + maxWords);

						if (startWord + maxWords > totalWords) {
							startWord = Math.max(0, totalWords - maxWords);
							endWord = totalWords;
						}
						if (startWord < 0) {
							startWord = 0;
							endWord = Math.min(totalWords, maxWords);
						}

						const passageStart = words.slice(0, startWord).join(' ').length;
						const passageEnd = words.slice(0, endWord).join(' ').length + 1;

						result = {
							passage: this.getPassage(passageStart, passageEnd, originalMatch.start, originalMatch.end),
							verseRange: this.findVerseRange(passageStart, passageEnd)
						};
					}
				}

				// Create a unique key for the result to avoid duplicates
				const resultKey = isComment ? 
					`${result.commentNb}-${result.passage}` :
					`${result.verseRange}-${result.passage}`;

				if (!seenResults.has(resultKey)) {
					seenResults.add(resultKey);
					
					// Call the callback with the individual result
					if (resultCallback) {
						await resultCallback(result);
					}
					
					results.push(result);

					if (singleResult) break;
				}
			}

			// If we have enough results, break out of the outer loop
			if (singleResult && results.length >= 1) break;
		}

		return results;
	}

    findOriginalTextMatch(processedMatchStart, processedMatchEnd) {
		// Use the position map to find the original positions
		const originalStart = this.positionMap.get(processedMatchStart);
		let originalEnd = this.positionMap.get(processedMatchEnd);

		// If we don't have an exact match for the end, find the closest position
		if (originalEnd === undefined) {
			let i = processedMatchEnd;
			while (i >= processedMatchStart && originalEnd === undefined) {
				originalEnd = this.positionMap.get(i);
				i--;
			}
			// Adjust to the end of the word if necessary
			while (originalEnd < this.fullText.length &&
				   !/[\s\u00A0]|&nbsp;/.test(this.fullText[originalEnd])) {
				originalEnd++;
			}
		}

		return {
			start: originalStart,
			end: originalEnd
		};
	}
}

// Main search function
export const searchSutta = async (textData, searchTerm, isComment = false, strict = false, pali = false, singleResult = false, maxWords, resultCallback) => {
    if (!textData || !searchTerm || typeof searchTerm !== 'string') {
        return [];
    }
    
    const searcher = new SuttaSearch(textData, pali);
    return await searcher.findMatches(searchTerm, strict, isComment, singleResult, maxWords, resultCallback);
};

export default searchSutta;
