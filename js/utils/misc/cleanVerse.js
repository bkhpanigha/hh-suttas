export const cleanVerse = (text) => {
    text = text.replace(/[_*]([^_*]+)[_*]/g, '$1');
    text = text.replace(/<em>([^<]+)<\/em>/g, '$1');
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    return text;
};