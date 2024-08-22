var converter = new showdown.Converter()

async function displayComments() {
    const response = await fetch('available_suttas.json');
    const availableSuttas = await response.json();
    const availableSuttasJson = availableSuttas['available_suttas'];
    const commentsArea = document.getElementById("commentsArea");
  
    const books = {
      "dn": "Dīgha Nikāya",
      "mn": "Majjhima Nikāya",
      "sn": "Saṃyutta Nikāya",
      "an": "Aṅguttara Nikāya",
      "kn": "Khuddaka Nikāya"
    };
    let currentGroup = -1;
    let htmlContent = '';
    let isOpen = false;  // Keep track of whether a <details> section is open
  
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
        if (currentGroup < 4) {  // TODO hack for kn fix with better logic
        if (isOpen) {
          htmlContent += `</ul></details>`;
          isOpen = false;  // Set flag to indicate no open <details>
        }
          currentGroup += 1;
          // Open a new <details> section
          const key = bookKeys[currentGroup];
          htmlContent += `
            <details>
              <summary>${books[key]}</summary>
              <ul>
          `;
          isOpen = true;  // Set flag to indicate that a <details> section is open
        }
      }
  
      // Fetch and display comments for the current sutta
      try {
        // Add the sutta and comments to the HTML
        htmlContent += `<li>${link}${em ? ` (${em})` : ''}</li>`;
        const commentResponse = await fetch(sutta_details['comment_path']);
        if (!commentResponse.ok) {
          console.warn(`Comment file not found for ${sutta_id}`);
          continue;
        }
        const comment_text = await commentResponse.json();
  

        Object.entries(comment_text).forEach(([key, comment]) => {
          if (comment.trim() !== '') {  // Check if comment is not an empty string after trimming whitespace
            htmlContent += `<p><a href="/?q=${sutta_id}#${key}">${key}</a>: ${converter.makeHtml(comment).replace(/^<p>(.*)<\/p>$/, '$1')}</p>`;
        }
        });
      } catch (error) {
      }
    }
  
    // Close the last <details> section if it's still open
    if (isOpen) {
      htmlContent += `</ul></details>`;
    }
  
    commentsArea.innerHTML = htmlContent;
  }
  
  // Call the function to display comments
  displayComments();