export function getVersePrefix(verse) {
    return verse.match(/^[a-z]+/i)[0];
}