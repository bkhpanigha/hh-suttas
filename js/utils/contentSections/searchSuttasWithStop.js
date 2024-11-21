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

// Search result handlers
class SearchResultHandler {
    constructor(loadingBar, resultsDiv) {
        this.loadingBar = loadingBar;
        this.resultsDiv = resultsDiv;
        this.hasResults = false;
        this.currentIteration = 0;
        this.totalIterations = 0;
    }

    initialize(total) {
        this.totalIterations = total;
        this.currentIteration = 0;
        this.hasResults = false;
        this.resultsDiv.innerHTML = '';
    }

    updateProgress() {
        this.currentIteration++;
        this.loadingBar.setTargetProgress((this.currentIteration / this.totalIterations) * 100);
    }

    markHasResults() {
        this.hasResults = true;
    }
}

class ResultProcessor {
    constructor(availableSuttasJson, searchTerm, options, searchTermUrl) {
        this.availableSuttasJson = availableSuttasJson;
        this.searchTerm = searchTerm;
        this.options = options;
        this.searchTermUrl = searchTermUrl;
    }

    async processResult(sutta, content, isPali = false) {
        const { id, title, heading } = getIdAndTitle(sutta, this.availableSuttasJson, isPali ? 'pl' : 'en');
        let titleMatch = false;
        let idMatch = false;
        let displayTitle = title;
        let displayId = id;

        if (checkIdMatch(id, this.searchTerm, this.options.strict)) {
            idMatch = true;
            displayId = highlightSearchTerm(id, this.searchTerm, true);
        }

        if (checkTitleMatch(title, this.searchTerm, this.options.strict) || 
            checkTitleMatch(heading, this.searchTerm, this.options.strict)) {
            titleMatch = true;
            displayTitle = highlightSearchTerm(title, this.searchTerm);
            if (heading) {
                displayTitle += ` (${highlightSearchTerm(heading, this.searchTerm)})`;
            }
        }

        return {
            finalDisplayTitle: (idMatch || titleMatch) ? 
                `${displayId} - ${displayTitle}` : 
                `${id} - ${title}`,
            titleMatch,
            idMatch
        };
    }
}

class ContentProcessor {
    constructor(resultProcessor, maxWordsEn, maxWordsPl, resultHandler) {
        this.resultProcessor = resultProcessor;
        this.maxWordsEn = maxWordsEn;
        this.maxWordsPl = maxWordsPl;
        this.resultHandler = resultHandler;
    }

    async processCommentContent(sutta) {
        if (!sutta.comment) return;
        
        const { finalDisplayTitle } = await this.resultProcessor.processResult(sutta, sutta.comment);
        await this.searchInComment(sutta, finalDisplayTitle);
    }

    async processEnglishContent(sutta) {
        if (!sutta.translation_en_anigha || searchState.shouldStopSearch) return;

        const { finalDisplayTitle, titleMatch, idMatch } = await this.resultProcessor.processResult(sutta, sutta.translation_en_anigha);
        
        await this.processMatchedTitle(sutta, finalDisplayTitle, titleMatch, idMatch, false);
        await this.searchInEnglishText(sutta, finalDisplayTitle);
    }

    async processPaliContent(sutta) {
        if (!sutta.root_pli_ms || searchState.shouldStopSearch) return;

        const { finalDisplayTitle, titleMatch, idMatch } = await this.resultProcessor.processResult(sutta, sutta.root_pli_ms, true);
        
        await this.processMatchedTitle(sutta, finalDisplayTitle, titleMatch, idMatch, true);
        await this.searchInPaliText(sutta, finalDisplayTitle);
    }

    async processMatchedTitle(sutta, finalDisplayTitle, titleMatch, idMatch, isPali) {
        if (!(titleMatch || idMatch)) return;

        const content = isPali ? sutta.root_pli_ms : sutta.translation_en_anigha;
        const maxWords = isPali ? this.maxWordsPl : this.maxWordsEn;
        const firstPassage = getFirstPassage(content, maxWords);
        
        await addResultToDOMAsync(
            finalDisplayTitle,
            firstPassage,
            `${window.location.origin}/?q=${sutta.id}&search=${this.resultProcessor.searchTermUrl}&pali=${isPali ? 'show' : this.resultProcessor.options.pali ? 'show' : 'hide'}`,
            { target: "_blank" },
            isPali ? "pli" : "en"
        );
        this.resultHandler.markHasResults();
    }

    async searchInComment(sutta, finalDisplayTitle) {
        await searchSutta(
            sutta.comment,
            this.resultProcessor.searchTerm,
            true,
            this.resultProcessor.options.strict,
            false,
            this.resultProcessor.options.single,
            this.maxWordsEn,
            async (result) => {
                await addResultToDOMAsync(
                    finalDisplayTitle,
                    result.passage,
                    `${window.location.origin}/?q=${sutta.id}&search=${this.resultProcessor.searchTermUrl}#comment${result.commentNb}`,
                    { target: "_blank" },
                    "com"
                );
                this.resultHandler.markHasResults();
            }
        );
    }

    async searchInEnglishText(sutta, finalDisplayTitle) {
        await searchSutta(
            sutta.translation_en_anigha,
            this.resultProcessor.searchTerm,
            false,
            this.resultProcessor.options.strict,
            false,
            this.resultProcessor.options.single,
            this.maxWordsEn,
            async (result) => {
                await addResultToDOMAsync(
                    finalDisplayTitle,
                    result.passage,
                    `${window.location.origin}/?q=${sutta.id}&search=${this.resultProcessor.searchTermUrl}&pali=${this.resultProcessor.options.pali ? 'show' : 'hide'}#${result.verseRange}`,
                    { target: "_blank" },
                    "en"
                );
                this.resultHandler.markHasResults();
            }
        );
    }

    async searchInPaliText(sutta, finalDisplayTitle) {
        await searchSutta(
            sutta.root_pli_ms,
            this.resultProcessor.searchTerm,
            false,
            this.resultProcessor.options.strict,
            true,
            this.resultProcessor.options.single,
            this.maxWordsPl,
            async (result) => {
                await addResultToDOMAsync(
                    finalDisplayTitle,
                    result.passage,
                    `${window.location.origin}/?q=${sutta.id}&search=${this.resultProcessor.searchTermUrl}&pali=show#${result.verseRange}`,
                    { target: "_blank" },
                    "pli"
                );
                this.resultHandler.markHasResults();
            }
        );
    }
}

export async function searchSuttasWithStop(searchTerm, options) {
    const availableSuttasJson = await fetchAvailableSuttas();
    const originalSearch = searchTerm;
    searchTerm = cleanSearchTerm(searchTerm.toLowerCase());
    
    const { maxWordsEn, maxWordsPl } = getSearchLimits();
    const resultsDiv = document.querySelector('.results');
    const loadingBar = new LoadingBarManager(document.getElementById('loadingBar'));
    const resultHandler = new SearchResultHandler(loadingBar, resultsDiv);
    const searchTermUrl = encodeStringForURL(searchTerm);
    
    const suttasEn = (options.en || options.comments) ? await getSuttas(db, options, 'en') : [];
    const suttasPl = (!options.comments && options.pali) ? await getSuttas(db, options, 'pl') : [];
    
    const suttaMap = new Map();

    if (options.comments) {
        suttasEn.forEach(sutta => {
            if (sutta.comment) {
                suttaMap.set(sutta.id, { id: sutta.id, comment: sutta.comment });
            }
        });
    } else if (options.en && options.pali) {
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
        const suttas = options.en ? suttasEn : suttasPl;
        suttas.forEach(sutta => suttaMap.set(sutta.id, sutta));
    }

    resultHandler.initialize(suttaMap.size);
    
    const resultProcessor = new ResultProcessor(availableSuttasJson, searchTerm, options, searchTermUrl);
    const contentProcessor = new ContentProcessor(resultProcessor, maxWordsEn, maxWordsPl, resultHandler);

    for (const [suttaId, sutta] of suttaMap) {
        if (searchState.shouldStopSearch) {
            await loadingBar.reset(true);
            return;
        }

        if (options.comments) {
            await contentProcessor.processCommentContent(sutta);
        } else {
            if (options.en) {
                await contentProcessor.processEnglishContent(sutta);
            }
            if (options.pali) {
                await contentProcessor.processPaliContent(sutta);
            }
            if (sutta.comment) {
                await contentProcessor.processCommentContent(sutta);
            }
        }

        resultHandler.updateProgress();
    }

    if (!resultHandler.hasResults && !searchState.shouldStopSearch) {
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
