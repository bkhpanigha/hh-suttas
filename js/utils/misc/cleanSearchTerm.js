export const cleanSearchTerm = (inputText) => {
    let cleanedText = inputText
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    cleanedText = cleanedText
        .replace(/([,.!?])\s*(?=[A-Z])/g, '$1 ')
        .replace(/(\s*-\s*)/g, '-');

    return cleanedText;
};