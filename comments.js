var converter = new showdown.Converter();

async function displayComments() {
    const response = await fetch('python/generated/available_suttas.json');
    const availableSuttas = await response.json();
    const availableSuttasJson = availableSuttas['available_suttas'];
    const commentsArea = document.getElementById("commentsArea");
    const progressBar = document.getElementById("progressBar");

    const books = {
        "dn": "Dīgha Nikāya",
        "mn": "Majjhima Nikāya",
        "sn": "Saṃyutta Nikāya",
        "an": "Aṅguttara Nikāya",
        "kn": "Khuddaka Nikāya"
    };
    let currentGroup = -1;
    let htmlContent = '';
    let isOpen = false; // Keep track of whether a <details> section is open
    const commentPromises = []; // Array to hold comment fetch promises
    const commentData = {}; // Object to store fetched comment data

    // Total number of fetch requests (for progress calculation)
    const totalFetches = Object.keys(availableSuttasJson).length;
    let completedFetches = 0; // Track how many fetches are completed

    // First loop: collect promises to fetch comments
    for (const [sutta_id, sutta_details] of Object.entries(availableSuttasJson)) {
        const commentPromise = fetch(sutta_details['comment_path'])
            .then(commentResponse => {
                if (!commentResponse.ok) {
                    console.warn(`Comment file not found for ${sutta_id}`);
                    return null;
                }
                return commentResponse.json().then(comment_text => {
                    commentData[sutta_id] = comment_text; // Store comment data
                });
            })
            .catch(error => {
                console.warn(`Error fetching comments for ${sutta_id}:`, error);
            })
            .finally(() => {
                // Update the progress bar
                completedFetches += 1;
                const progressPercentage = (completedFetches / totalFetches) * 100;
                progressBar.value = progressPercentage;
            });

        // Push the promise to the array
        commentPromises.push(commentPromise);
    }

    // Wait for all the comment fetches to complete
    await Promise.all(commentPromises);

    // Second loop: now that we have all the comments, generate the full HTML
    for (const [sutta_id, sutta_details] of Object.entries(availableSuttasJson)) {
        const id = sutta_details['id'].replace(/\s+/g, '');
        const title = sutta_details['title'];
        const heading = sutta_details['heading'] || "";
        const link = `<a href="/?q=${id.toLowerCase()}">${id}: ${title}</a>`;
        const em = heading ? `<span style="color: #7f6e0a;"><em>${heading}</em></span>` : '';
        const nikaya = sutta_id.slice(0, 2).toLowerCase();

        // Check if the current sutta belongs to a new group
        const bookKeys = Object.keys(books);
        if (currentGroup < bookKeys.length && nikaya !== bookKeys[currentGroup]) {
            // Close the previous <details> section if it is open
            if (currentGroup < 4) { // TODO hack for kn fix with better logic
                if (isOpen) {
                    htmlContent += `</ul></details>`;
                    isOpen = false; // Set flag to indicate no open <details>
                }
                currentGroup += 1;
                // Open a new <details> section
                const key = bookKeys[currentGroup];
                htmlContent += `
                    <details>
                        <summary>${books[key]}</summary>
                        <ul>
                `;
                isOpen = true; // Set flag to indicate that a <details> section is open
            }
        }

        // Add the sutta and comments to the HTML
        htmlContent += `<li>${link}${em ? ` (${em})` : ''}`;

        // Retrieve the comment data and append it to the Sutta's HTML
        const comment_text = commentData[sutta_id];
        if (comment_text) {
            Object.entries(comment_text).forEach(([key, comment]) => {
                if (comment.trim() !== '') {
                    // Append comment after the corresponding Sutta link
                    htmlContent += `<p><a href="/?q=${sutta_id}#${key}">${key}</a>: ${converter.makeHtml(comment).replace(/^<p>(.*)<\/p>$/, '$1')}</p>`;
                }
            });
        }

        // Close the list item after adding the comments
        htmlContent += `</li>`;
    }

    // Close the last <details> section if it's still open
    if (isOpen) {
        htmlContent += `</ul></details>`;
    }

    commentsArea.innerHTML = htmlContent;

    // Once all comments are loaded, hide the progress bar
    progressContainer.style.display = 'none';
}

// Call the function to display comments
displayComments();
