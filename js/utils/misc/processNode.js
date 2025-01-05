import { getParentTags } from './getParentTags.js';

export function processNode(node, textParts, currentText = '') {
    if (node.nodeType === 3) {
        const text = node.textContent;
        const startPos = currentText.length;
        currentText += text;
        textParts.push({
            type: 'text',
            text: text,
            start: startPos,
            length: text.length,
            parentTags: getParentTags(node)
        });
    } else if (node.nodeType === 1) {
        if (node.tagName === 'A' && node.textContent !== '←') {
            const text = node.textContent;
            const startPos = currentText.length;
            currentText += text;
            textParts.push({
                type: 'a',
                text: text,
                html: node.outerHTML,
                href: node.getAttribute('href'),
                start: startPos,
                length: text.length
            });
        } else {
            for (const child of node.childNodes) {
                currentText = processNode(child, textParts, currentText);
            }
        }
    }
    return currentText;
}