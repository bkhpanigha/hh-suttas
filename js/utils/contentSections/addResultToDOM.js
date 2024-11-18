export function addResultToDOM(title, snippet, link, options = {}) {
    const resultsDiv = document.querySelector('.results');
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('result');

    let anchor;
    if (link != "none") {
        anchor = document.createElement('a');
        anchor.href = link;
        anchor.target = options.target || '_self';
        anchor.classList.add('link');
    }

    const titleElement = document.createElement('h3');
    titleElement.innerHTML = title;

    const preview = document.createElement('p');
    preview.innerHTML = snippet;

    if (link != "none") {
        anchor.appendChild(titleElement);
        anchor.appendChild(preview);
        resultDiv.appendChild(anchor);
    } else {
        resultDiv.appendChild(titleElement);
        resultDiv.appendChild(preview);
    }
    resultsDiv.appendChild(resultDiv);
}

export function addResultToDOMAsync(title, snippet, link, options) {
    return new Promise((resolve) => {
        setTimeout(() => {
            addResultToDOM(title, snippet, link, options);
            resolve();
        }, 0);
    });
}
