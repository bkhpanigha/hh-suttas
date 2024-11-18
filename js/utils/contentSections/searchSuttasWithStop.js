import { cleanSearchTerm } from '../misc/cleanSearchTerm.js';
import { encodeStringForURL } from '../misc/encodeStringForURL.js';
import { escapeRegExp } from '../misc/escapeRegExp.js';
import { getFirstPassage } from './getFirstPassage.js';
import { addResultToDOM, addResultToDOMAsync } from './addResultToDOM.js';
import { getSuttas } from '../loadContent/getSuttas.js';
import { searchSutta } from './SuttaSearch.js';
import { searchState } from '../userActions/searchState.js';
import { fetchAvailableSuttas } from "../loadContent/fetchAvailableSuttas.js";
import { removeDiacritics } from '../misc/removeDiacritics.js';
import { getSearchLimits } from '../misc/advancedSearchConfig.js';
import { LoadingBarManager } from '../LoadingBarManager.js';
import db from "../../dexie/dexie.js";

export async function searchSuttasWithStop(searchTerm, options) {
    const availableSuttasJson = await fetchAvailableSuttas();
    const originalSearch = searchTerm;
    searchTerm = cleanSearchTerm(searchTerm.toLowerCase());
    
    const { maxWordsEn, maxWordsPl } = getSearchLimits();
    
    const resultsDiv = document.querySelector('.results');
    const loadingBar = new LoadingBarManager(document.getElementById('loadingBar'));
    resultsDiv.innerHTML = ''; 
    
    const [suttasEn, suttasPl] = await Promise.all([
        options['en'] ? getSuttas(db, options, 'en') : [],
        options['pali'] ? getSuttas(db, options, 'pl') : []
    ]);

    const totalIterations = suttasEn.length * 2 + suttasPl.length;
    let currentIteration = 0;
    let hasAnyResults = false;

    const searchTermUrl = encodeStringForURL(searchTerm);

    const processResult = async (result, sutta, id, displayTitle, isComment = false) => {
        if (searchState.shouldStopSearch) return;

        const link = isComment 
            ? `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}#comment${result.commentNb}`
            : `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}&pali=${options['pali'] ? 'show' : 'hide'}#${result.verseRange}`;

        const title = isComment ? `${displayTitle} - Comments` : displayTitle;
        await addResultToDOMAsync(title, result.passage, link, { target: "_blank" });
        return true;
    };

    const updateProgress = () => {
        currentIteration++;
        loadingBar.setTargetProgress((currentIteration / totalIterations) * 100);
    };

    const searchAndAddResults = async (suttas, lang) => {
        for (const sutta of suttas) {
            if (searchState.shouldStopSearch) {
                await loadingBar.reset(true);
                return;
            }

            let currentSuttaHasResults = false;
            const { id, title, heading } = getIdAndTitle(sutta, availableSuttasJson, lang);
            let titleMatch = false;
            let idMatch = false;
            let displayTitle = title;
            let displayId = id;

            if (checkIdMatch(id, searchTerm, options['strict'])) {
                idMatch = true;
                displayId = highlightSearchTerm(id, searchTerm, true);
            }

            if (lang === 'en') {
                if (checkTitleMatch(title, searchTerm, options['strict']) || 
                    checkTitleMatch(heading, searchTerm, options['strict'])) {
                    titleMatch = true;
                    displayTitle = highlightSearchTerm(title, searchTerm);
                    if (heading) {
                        displayTitle += ` (${highlightSearchTerm(heading, searchTerm)})`;
                    }
                }
            } else if (lang === 'pl') {
                if (checkTitleMatch(title, searchTerm, options['strict'])) {
                    titleMatch = true;
                    displayTitle = highlightSearchTerm(title, searchTerm);
                }
            }

            const finalDisplayTitle = (idMatch || titleMatch) ? 
                `${displayId} - ${displayTitle}` : 
                `${id} - ${title}`;

            if (lang === 'en') {
                const mainResults = await searchSutta(
                    sutta.translation_en_anigha, 
                    searchTerm,
                    false,
                    options['strict'],
                    false,
                    options['single'],
                    maxWordsEn,
                    async (result) => {
                        const success = await processResult(result, sutta, id, finalDisplayTitle);
                        if (success) currentSuttaHasResults = true;
                    }
                );

                if (sutta.comment) {
                    const commentResults = await searchSutta(
                        sutta.comment,
                        searchTerm,
                        true,
                        options['strict'],
                        false,
                        options['single'],
                        maxWordsEn,
                        async (result) => {
                            const success = await processResult(result, sutta, id, finalDisplayTitle, true);
                            if (success) currentSuttaHasResults = true;
                        }
                    );
                    updateProgress();
                }

				// If current sutta's english title/heading or sutta's id matched but current sutta's english content didn't match
                if ((titleMatch || idMatch) && !currentSuttaHasResults && !searchState.shouldStopSearch) {
                    const firstPassage = getFirstPassage(sutta.translation_en_anigha, maxWordsEn);
                    const link = `${window.location.origin}/?q=${sutta.id}`;
                    await addResultToDOMAsync(finalDisplayTitle, firstPassage, link, { target: "_blank" });
                    currentSuttaHasResults = true;
                }
            } else if (lang === 'pl') {
                const results = await searchSutta(
                    sutta.root_pli_ms,
                    searchTerm,
                    false,
                    options['strict'],
                    true,
                    options['single'],
                    maxWordsPl,
                    async (result) => {
                        const success = await processResult(result, sutta, id, finalDisplayTitle);
                        if (success) currentSuttaHasResults = true;
                    }
                );

				// If current sutta's pali title or sutta's id matched but current sutta's pali content didn't match
                if ((titleMatch || idMatch) && !currentSuttaHasResults && !searchState.shouldStopSearch) {
                    const firstPassage = getFirstPassage(sutta.root_pli_ms, maxWordsPl);
                    const link = `${window.location.origin}/?q=${sutta.id}`;
                    await addResultToDOMAsync(finalDisplayTitle, firstPassage, link, { target: "_blank" });
                    currentSuttaHasResults = true;
                }
            }
            
            if (currentSuttaHasResults) {
                hasAnyResults = true;
            }
            updateProgress();
        }
    };

    await Promise.all([
        searchAndAddResults(suttasEn, 'en'),
        searchAndAddResults(suttasPl, 'pl')
    ]);

    if (!hasAnyResults && !searchState.shouldStopSearch) {
        addResultToDOM("No results found", `No results were found with the expression: ${originalSearch}`, "none");
    }

    if (!searchState.shouldStopSearch) {
        await loadingBar.reset();
    }
}

function getIdAndTitle(sutta, availableSuttasJson, lang) {
    const availableSutta = availableSuttasJson[sutta.id] || {};
    return {
        id: availableSutta.id || sutta.id.toUpperCase(),
        title: lang === 'en' ? availableSutta.title : availableSutta.pali_title || "Unknown Title",
        heading: availableSutta.heading || ""
    };
}

function checkIdMatch(id, searchTerm, strict) {
    if (!id) return false;
    
	const normalizedId = normalizeText(id);
	const normalizedSearchTerm = normalizeText(searchTerm);
	
	// Standard check, if strict==true we check for perfect equality, otherwise we check if term is included
	if ((strict && normalizedId === normalizedSearchTerm) || (!strict && normalizedId.includes(normalizedSearchTerm))){
		return true;
	}
	
	// Check without spaces in ID
	const idWithoutSpaces = normalizedId.replace(/\s+/g, '');
	const searchTermWithoutSpaces = normalizedSearchTerm.replace(/\s+/g, '');
	
	// If strict==true we check for perfect equality, otherwise we check if term is included
	return (strict ? idWithoutSpaces === searchTermWithoutSpaces : idWithoutSpaces.includes(searchTermWithoutSpaces));
}

function checkTitleMatch(text, searchTerm, strict) {
    if (!text) return false;
    
    if (strict) {
        return checkStrictMatch(text, searchTerm);
    } else {
        const normalizedText = normalizeText(text);
        const normalizedSearchTerm = normalizeText(searchTerm);
        return normalizedText.includes(normalizedSearchTerm) ||
               removeDiacritics(normalizedText).includes(removeDiacritics(normalizedSearchTerm));
    }
}

function checkStrictMatch(text, searchTerm) {
    if (!text) return false;
    
    const normalizedText = normalizeText(text);
    const normalizedSearchTerm = normalizeText(searchTerm);
    
    const punctuation = '[\\s.,!?;"\'\\)\\]\\}\\-:/]*';
    const searchPattern = `(^|[\\s.,!?;"'\\(\\[\\{\\-:/]+)${escapeRegExp(normalizedSearchTerm)}(?=${punctuation}($|[\\s.,!?;"'\\(\\[\\{\\-:/]+))`;
    const regex = new RegExp(searchPattern, 'i');
    
    return regex.test(normalizedText) || 
           regex.test(removeDiacritics(normalizedText));
}

function normalizeText(text) {
    return text.toLowerCase().trim();
}

function highlightSearchTerm(text, searchTerm, isId = false) {
  if (!text) return '';

  const normalizedSearchTerm = normalizeText(searchTerm);
  let result = text;

  const highlightMatches = (text, pattern) => {
    const matches = [...text.matchAll(pattern)];
    let highlighted = text;
    let offset = 0;

    matches.forEach(match => {
      const startPos = match.index + offset;
      const originalText = match[0];
      const highlightedText = `<b>${originalText}</b>`;
      highlighted = highlighted.slice(0, startPos) + highlightedText + highlighted.slice(startPos + originalText.length);
      offset += highlightedText.length - originalText.length;
    });

    return highlighted;
  };

  if (isId) {
    const textWithoutSpaces = text.replace(/\s+/g, '').toLowerCase();
    const searchTermWithoutSpaces = normalizedSearchTerm.replace(/\s+/g, '');

    if (textWithoutSpaces.includes(searchTermWithoutSpaces)) {
      // Find the position of the match in the version without spaces
      const matchStartIndex = textWithoutSpaces.indexOf(searchTermWithoutSpaces);

      // Count the characters until the beginning of the match in the version with spaces
      let spaceCount = 0;
      let originalStartIndex = 0;
      let currentIndexWithoutSpaces = 0;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          spaceCount++;
          continue;
        }
        if (currentIndexWithoutSpaces === matchStartIndex) {
          originalStartIndex = i;
          break;
        }
        currentIndexWithoutSpaces++;
      }

      // Count the length of the part to be highlighted in the original text
      let lengthWithSpaces = 0;
      let remainingCharsToMatch = searchTermWithoutSpaces.length;

      for (let i = originalStartIndex; i < text.length && remainingCharsToMatch > 0; i++) {
        lengthWithSpaces++;
        if (text[i] !== ' ') {
          remainingCharsToMatch--;
        }
      }

      // Prepare the text with the highlighted part
      const beforeMatch = text.slice(0, originalStartIndex);
      const matchedPart = text.slice(originalStartIndex, originalStartIndex + lengthWithSpaces);
      const afterMatch = text.slice(originalStartIndex + lengthWithSpaces);

      return beforeMatch + `<b>${matchedPart}</b>` + afterMatch;
    }
  }

  const exactPattern = new RegExp(`(${escapeRegExp(normalizedSearchTerm)})`, 'gi');
  const diacriticPattern = new RegExp(escapeRegExp(removeDiacritics(normalizedSearchTerm)), 'gi');

  result = highlightMatches(result, exactPattern);

  if (!exactPattern.test(text)) {
    const textWithoutDiacritics = removeDiacritics(text);
    const matches = [...textWithoutDiacritics.matchAll(diacriticPattern)];

    matches.forEach(match => {
      const startPos = match.index;
      const length = match[0].length;
      const originalText = text.slice(startPos, startPos + length);
      result = result.replace(originalText, `<b>${originalText}</b>`);
    });
  }

  return result;
}
