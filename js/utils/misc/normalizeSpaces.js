export const normalizeSpaces = (text) => {
    return text.replace(/\u00A0/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
};