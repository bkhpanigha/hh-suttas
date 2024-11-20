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
    
    // Get English suttas if comments or English is enabled
    const suttasEn = (options['en'] || options['comments']) ? await getSuttas(db, options, 'en') : [];
    const suttasPl = (!options['comments'] && options['pali']) ? await getSuttas(db, options, 'pl') : [];
    
    // Check if multiple languages are enabled and comments search is not active
    const multipleLang = !options['comments'] && options['en'] && options['pali'];
    
    // Create a map of sutta ID to their content
    const suttaMap = new Map();

    if (options['comments']) {
        // Only include suttas with comments when comments option is true
        suttasEn.forEach(sutta => {
            if (sutta.comment) {
                suttaMap.set(sutta.id, {
                    id: sutta.id,
                    comment: sutta.comment
                });
            }
        });
    } else if (multipleLang) {
        [...suttasEn, ...suttasPl].forEach(sutta => {
            if (!suttaMap.has(sutta.id)) {
                suttaMap.set(sutta.id, {
                    id: sutta.id,
                    translation_en_anigha: null,
                    comment: null,
                    root_pli_ms: null
                });
            }
            const existingSutta = suttaMap.get(sutta.id);
            if (sutta.translation_en_anigha) existingSutta.translation_en_anigha = sutta.translation_en_anigha;
            if (sutta.comment) existingSutta.comment = sutta.comment;
            if (sutta.root_pli_ms) existingSutta.root_pli_ms = sutta.root_pli_ms;
        });
    } else {
        const suttas = options['en'] ? suttasEn : suttasPl;
        suttas.forEach(sutta => {
            suttaMap.set(sutta.id, sutta);
        });
    }

    const totalIterations = suttaMap.size;
    let currentIteration = 0;
    let hasAnyResults = false;
    const searchTermUrl = encodeStringForURL(searchTerm);

    const updateProgress = () => {
        currentIteration++;
        loadingBar.setTargetProgress((currentIteration / totalIterations) * 100);
    };

    for (const [suttaId, sutta] of suttaMap) {
        if (searchState.shouldStopSearch) {
            await loadingBar.reset(true);
            return;
        }

        const { id, title, heading } = getIdAndTitle(sutta, availableSuttasJson, 'en');
        let titleMatch = false;
        let idMatch = false;
        let displayTitle = title;
        let displayId = id;

        if (checkIdMatch(id, searchTerm, options['strict'])) {
            idMatch = true;
            displayId = highlightSearchTerm(id, searchTerm, true);
        }

        if (checkTitleMatch(title, searchTerm, options['strict']) || 
            checkTitleMatch(heading, searchTerm, options['strict'])) {
            titleMatch = true;
            displayTitle = highlightSearchTerm(title, searchTerm);
            if (heading) {
                displayTitle += ` (${highlightSearchTerm(heading, searchTerm)})`;
            }
        }

        const finalDisplayTitle = (idMatch || titleMatch) ? 
            `${displayId} - ${displayTitle}` : 
            `${id} - ${title}`;

        if (options['comments']) {
            // In comments-only mode
            if (sutta.comment) {
                await searchSutta(
                    sutta.comment,
                    searchTerm,
                    true,
                    options['strict'],
                    false,
                    options['single'],
                    maxWordsEn,
                    async (result) => {
                        await addResultToDOMAsync(
                            `${finalDisplayTitle} [Comments]`,
                            result.passage,
                            `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}#comment${result.commentNb}`,
                            { target: "_blank" }
                        );
                        hasAnyResults = true;
                    }
                );
            }
        } else {
            // Normal search flow
            if ((titleMatch || idMatch) && !searchState.shouldStopSearch) {
                const firstPassage = getFirstPassage(
                    sutta.translation_en_anigha || sutta.root_pli_ms,
                    sutta.translation_en_anigha ? maxWordsEn : maxWordsPl
                );
                await addResultToDOMAsync(
                    multipleLang ? `${finalDisplayTitle} [EN]` : finalDisplayTitle,
                    firstPassage,
                    `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}&pali=${options['pali'] ? 'show' : 'hide'}`,
                    { target: "_blank" }
                );
                hasAnyResults = true;
            }

            // Search in English content if enabled
            if (options['en'] && !searchState.shouldStopSearch) {
                if (sutta.translation_en_anigha) {
                    await searchSutta(
                        sutta.translation_en_anigha,
                        searchTerm,
                        false,
                        options['strict'],
                        false,
                        options['single'],
                        maxWordsEn,
                        async (result) => {
                            await addResultToDOMAsync(
                                multipleLang ? `${finalDisplayTitle} [EN]` : finalDisplayTitle,
                                result.passage,
                                `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}&pali=${options['pali'] ? 'show' : 'hide'}#${result.verseRange}`,
                                { target: "_blank" }
                            );
                            hasAnyResults = true;
                        }
                    );
                }

                // Also search in comments when English is enabled
                if (sutta.comment) {
                    await searchSutta(
                        sutta.comment,
                        searchTerm,
                        true,
                        options['strict'],
                        false,
                        options['single'],
                        maxWordsEn,
                        async (result) => {
                            await addResultToDOMAsync(
                                `${finalDisplayTitle} [Comments]`,
                                result.passage,
                                `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}#comment${result.commentNb}`,
                                { target: "_blank" }
                            );
                            hasAnyResults = true;
                        }
                    );
                }
            }

            // Search in Pali content if enabled
            if (options['pali'] && sutta.root_pli_ms && !searchState.shouldStopSearch) {
                await searchSutta(
                    sutta.root_pli_ms,
                    searchTerm,
                    false,
                    options['strict'],
                    true,
                    options['single'],
                    maxWordsPl,
                    async (result) => {
                        await addResultToDOMAsync(
                            multipleLang ? `${finalDisplayTitle} [PLI]` : finalDisplayTitle,
                            result.passage,
                            `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}&pali=show#${result.verseRange}`,
                            { target: "_blank" }
                        );
                        hasAnyResults = true;
                    }
                );
            }
        }

        updateProgress();
    }

    if (!hasAnyResults && !searchState.shouldStopSearch) {
        addResultToDOM("No results found", `No results were found with the expression: ${originalSearch}`, "none");
    }

    await loadingBar.reset();
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
