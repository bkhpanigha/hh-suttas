export function getParentTags(node) {
    const tags = [];
    let current = node.parentElement;
    while (current && current.tagName !== 'SPAN') {
        tags.unshift({
            name: current.tagName.toLowerCase(),
            attributes: Array.from(current.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {})
        });
        current = current.parentElement;
    }
    return tags;
}