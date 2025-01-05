export function extractTextAndTags(html) {
    const tags = [];
    const emTags = [];
    let plainText = html;
    let offset = 0;

    const linkRegex = /<a[^>]*>.*?<\/a>/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        tags.push({
            type: 'a',
            start: match.index - offset,
            end: match.index + match[0].length - offset,
            tag: match[0]
        });
        offset += match[0].length;
    }

    const emRegex = /<em>(.*?)<\/em>/g;
    plainText = plainText.replace(linkRegex, '');
    offset = 0;
    
    while ((match = emRegex.exec(plainText)) !== null) {
        const content = match[1];
        emTags.push({
            type: 'em',
            start: match.index - offset,
            end: match.index + content.length - offset,
            content: content
        });
        offset += match[0].length - content.length;
    }

    plainText = plainText.replace(/<[^>]*>/g, '');

    return {
        plainText,
        tags: [...tags, ...emTags].sort((a, b) => a.start - b.start)
    };
}
