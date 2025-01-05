export function wrapWithTags(text, tags) {
    return tags.reduce((wrapped, tag) => {
        const attrs = Object.entries(tag.attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
        return `<${tag.name}${attrs ? ' ' + attrs : ''}>${wrapped}</${tag.name}>`;
    }, text);
}