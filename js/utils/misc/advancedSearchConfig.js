export function getSearchLimits() {
    let maxWordsEn = 150;
    let maxWordsPl = 100;

    if (window.innerWidth <= 768) {
        maxWordsEn = 75;
        maxWordsPl = 50;
    }

    return { maxWordsEn, maxWordsPl };
}