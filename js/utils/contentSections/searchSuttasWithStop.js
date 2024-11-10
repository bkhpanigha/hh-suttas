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
import db from "../../dexie/dexie.js";

export async function searchSuttasWithStop(searchTerm, options) {
    const availableSuttasJson = await fetchAvailableSuttas();
    const originalSearch = searchTerm;
    searchTerm = cleanSearchTerm(searchTerm.toLowerCase());
	
	const { maxWordsEn, maxWordsPl } = getSearchLimits();
	
    const resultsDiv = document.querySelector('.results');
    const loadingBar = document.getElementById('loadingBar');
    resultsDiv.innerHTML = ''; 
    loadingBar.style.width = '0%';
	
    const [suttasEn, suttasPl] = await Promise.all([
        options['en'] ? getSuttas(db, options, 'en') : [],
        options['pali'] ? getSuttas(db, options, 'pl') : []
    ]);

    const totalIterations = suttasEn.length * 2 + suttasPl.length;
    let currentIteration = 0;
    let gotResults = false;

    const searchTermUrl = encodeStringForURL(searchTerm);

    const searchAndAddResults = async (suttas, lang) => {
        for (const sutta of suttas) {
            if (searchState.shouldStopSearch) {
                loadingBar.style.width = '0%';
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

            const searchInContent = async (content, isComments = false) => {
                const results = await searchSutta(
                    content, 
                    searchTerm, 
                    isComments, 
                    options['strict'], 
                    lang === 'pl', 
                    options['single']
                );

                return results;
            };

            if (lang === 'en') {
                // Search in main content and comments
                const mainResults = await searchInContent(sutta.translation_en_anigha);
                let commentResults = [];
                if (sutta.comment) {
                    commentResults = await searchInContent(sutta.comment, true);
                    currentIteration++;
                    loadingBar.style.width = `${(currentIteration / totalIterations) * 100}%`;
                }

                // If we found matches in content or comments
                if (mainResults.length > 0 || commentResults.length > 0) {
                    // Add main content results with highlighted title if there was a title match
                    for (const result of mainResults) {
                        if (searchState.shouldStopSearch) return;  // Ajouté ici
                        const link = `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}&pali=hide#${result.verseRange}`;
                        await addResultToDOMAsync(id, titleMatch ? displayTitle : title, result.passage, link, { target: "_blank" });
                        gotResults = true;
                    }
                    // Add comment results
                    for (const result of commentResults) {
                        if (searchState.shouldStopSearch) return;  // Ajouté ici
                        const link = `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}#comment${result.commentNb}`;
                        await addResultToDOMAsync(id, `${titleMatch ? displayTitle : title} - Comments`, result.passage, link, { target: "_blank" });
                        gotResults = true;
                    }
                } 
                // If no content matches but title matches
                else if (titleMatch) {
                    if (searchState.shouldStopSearch) return;  // Ajouté ici
                    const firstPassage = getFirstPassage(sutta.translation_en_anigha, maxWordsEn);
                    const link = `${window.location.origin}/?q=${sutta.id}`;
                    await addResultToDOMAsync(id, displayTitle, firstPassage, link, { target: "_blank" });
                    gotResults = true;
                }
            } else if (lang === 'pl') {
                // Search in Pali content
                const results = await searchInContent(sutta.root_pli_ms);

                // If we found matches in content
                if (results.length > 0) {
                    // Add results with highlighted title if there was a title match
                    for (const result of results) {
                        if (searchState.shouldStopSearch) return;  // Ajouté ici
                        const link = `${window.location.origin}/?q=${sutta.id}&search=${searchTermUrl}&pali=show#${result.verseRange}`;
                        await addResultToDOMAsync(id, titleMatch ? displayTitle : title, result.passage, link, { target: "_blank" });
                        gotResults = true;
                    }
                }
                // If no content matches but title matches
                else if (titleMatch) {
                    if (searchState.shouldStopSearch) return;  // Ajouté ici
                    const firstPassage = getFirstPassage(sutta.root_pli_ms, maxWordsPl);
                    const link = `${window.location.origin}/?q=${sutta.id}`;
                    await addResultToDOMAsync(id, displayTitle, firstPassage, link, { target: "_blank" });
                    gotResults = true;
                }
            }
            
            currentIteration++;
            loadingBar.style.width = `${(currentIteration / totalIterations) * 100}%`;
        }
    };

    await Promise.all([
        searchAndAddResults(suttasEn, 'en'),
        searchAndAddResults(suttasPl, 'pl')
    ]);

    if (!gotResults && !searchState.shouldStopSearch) {
        addResultToDOM("", "No results found", `No results were found with the expression: ${originalSearch}`, "none");
    }

    loadingBar.style.width = '0%';
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
