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
    let gotResults = false;

    const searchTermUrl = encodeStringForURL(searchTerm);

    // Callback for results processing
    const processResult = async (result, sutta, id, displayTitle, isComment = false) => {
        if (searchState.shouldStopSearch) return;

        const link = isComment 
            ? `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}#comment${result.commentNb}`
            : `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}&pali=${options['pali'] ? 'show' : 'hide'}#${result.verseRange}`;

        const title = isComment ? `${displayTitle} - Comments` : displayTitle;
        await addResultToDOMAsync(id, title, result.passage, link, { target: "_blank" });
        gotResults = true;
    };

    const updateProgress = () => {
        currentIteration++;
        loadingBar.setTargetProgress((currentIteration / totalIterations) * 100);
    };

    const searchAndAddResults = async (suttas, lang) => {
        for (const sutta of suttas) {
            if (searchState.shouldStopSearch) {
                await loadingBar.reset(true);  // Instant reset
                return;
            }

            const { id, title, heading } = getIdAndTitle(sutta, availableSuttasJson, lang);
            let titleMatch = false;
            let displayTitle = title;

            // Check title and heading matches
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

            const finalDisplayTitle = titleMatch ? displayTitle : title;

            if (lang === 'en') {
                // Search in main content with progressive display
                const mainResults = await searchSutta(
                    sutta.translation_en_anigha, 
                    searchTerm,
                    false,
                    options['strict'],
                    false,
                    options['single'],
                    async (result) => processResult(result, sutta, id, finalDisplayTitle)
                );

                // Search in comments with progressive display
                if (sutta.comment) {
                    const commentResults = await searchSutta(
                        sutta.comment,
                        searchTerm,
                        true,
                        options['strict'],
                        false,
                        options['single'],
                        async (result) => processResult(result, sutta, id, finalDisplayTitle, true)
                    );
                    updateProgress();
                }

                // Handle title match without content match
                if (titleMatch && !gotResults && !searchState.shouldStopSearch) {
                    const firstPassage = getFirstPassage(sutta.translation_en_anigha, maxWordsEn);
                    const link = `${window.location.origin}/?q=${sutta.id}`;
                    await addResultToDOMAsync(id, finalDisplayTitle, firstPassage, link, { target: "_blank" });
                    gotResults = true;
                }
            } else if (lang === 'pl') {
                // Search in Pali content with progressive display
                const results = await searchSutta(
                    sutta.root_pli_ms,
                    searchTerm,
                    false,
                    options['strict'],
                    true,
                    options['single'],
                    async (result) => processResult(result, sutta, id, finalDisplayTitle)
                );

                // Handle title match without content match
                if (titleMatch && !gotResults && !searchState.shouldStopSearch) {
                    const firstPassage = getFirstPassage(sutta.root_pli_ms, maxWordsPl);
                    const link = `${window.location.origin}/?q=${sutta.id}`;
                    await addResultToDOMAsync(id, finalDisplayTitle, firstPassage, link, { target: "_blank" });
                    gotResults = true;
                }
            }
            
            updateProgress();
        }
    };

    await Promise.all([
        searchAndAddResults(suttasEn, 'en'),
        searchAndAddResults(suttasPl, 'pl')
    ]);

    if (!gotResults && !searchState.shouldStopSearch) {
        addResultToDOM("", "No results found", `No results were found with the expression: ${originalSearch}`, "none");
    }

    // Normal reset at the end if search complete
    if (!searchState.shouldStopSearch) {
        await loadingBar.reset();
    }
}

// Helper functions that are used only within searchSuttasWithStop
function getIdAndTitle(sutta, availableSuttasJson, lang) {
    const availableSutta = availableSuttasJson[sutta.id] || {};
    return {
        id: availableSutta.id || sutta.id.toUpperCase(),
        title: lang === 'en' ? availableSutta.title : availableSutta.pali_title || "Unknown Title",
        heading: availableSutta.heading || ""
    };
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

function highlightSearchTerm(text, searchTerm) {
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
