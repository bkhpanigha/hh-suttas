export function ensureSpaceBeforeClosing(element) {
    const langSpans = element.querySelectorAll('span.eng-lang, span.pli-lang');
    
    langSpans.forEach(span => {
        let html = span.innerHTML;
        const lastLink = span.querySelector('a:last-child');
        
        if (lastLink) {
            const beforeLink = html.slice(0, html.lastIndexOf(lastLink.outerHTML)).trim();
            if (!beforeLink.endsWith(' ')) {
                html = beforeLink + ' ' + lastLink.outerHTML;
                span.innerHTML = html;
            }
        } else {
            if (!html.trim().endsWith(' ')) {
                html = html.trimEnd() + ' ';
                span.innerHTML = html;
            }
        }
    });
}