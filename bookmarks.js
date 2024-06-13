function getRangeAsString(jsonObj, startKey, endKey) {
  let startKeyReached = false;
  let resultString = "";

  for (const key in jsonObj) {
    if (key === startKey) startKeyReached = true;
    if (startKeyReached) resultString += jsonObj[key];
    if (key === endKey) break;
  }

  return resultString;
}

async function displayBookmarks() {
  // Retrieve bookmarks from localStorage
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));

  // Check if bookmarks exist
  if (!bookmarks) {
    console.error('No bookmarks found in localStorage');
    return;
  }

  // Container to display the bookmarks
  const bookmarksDiv = document.getElementById('bookmarks');
  if (!bookmarksDiv) {
    console.error('No div with id "bookmarks" found');
    return;
  }

  // Clear the bookmarks div
  bookmarksDiv.innerHTML = '';

  // Process each bookmark
  for (const bookmark of bookmarks) {
    // Extract the file identifier and key
    const [fileIdentifier, key] = bookmark.split(':');

    // Split the fileIdentifier into the first alphanumeric part and the latter number part
    const match = fileIdentifier.match(/^([a-zA-Z]+)(\d+)/);
    if (!match) {
      console.error(`Invalid file identifier format: ${fileIdentifier}`);
      continue;
    }
    const [citation, book, numPart] = match;
    // TODO make this also adjustable incase of translations by other authors.
    const filePath = `suttas/translation_en/${book}/${book}${numPart}_translation-en-anigha.json`;

    try {
      // Fetch the file content
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}`);
      }
      const data = await response.json();

      let key = bookmark;
      // Check if the key is a range
      let value;
      if (key.includes('-')) {
        const [startKey, endKey] = key.split('-');
        value = getRangeAsString(data, startKey, endKey);
      } else {
        value = data[key];
      }

      if (value) {
        const container = document.createElement('div');
        container.className = 'bookmark-container';

        const pTag = document.createElement('p');
        pTag.textContent = value;
        container.appendChild(pTag);

        // Create a link with the citation as the text and the link being /?q={citation}#{bookmark}
        const link = document.createElement('a');
        link.href = `/?q=${citation}#${bookmark}`;
        link.textContent = citation;
        container.appendChild(link);

        // Create a delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteBookmark(bookmark);
        container.appendChild(deleteButton);
        bookmarksDiv.appendChild(container);
      } else {
        console.warn(`Key ${key} not found in ${filePath}`);
      }

    } catch (error) {
      console.error(error);
    }
  }
}
function deleteBookmark(bookmark) {
  // Retrieve bookmarks from localStorage
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks'));

  // Filter out the bookmark to be deleted
  bookmarks = bookmarks.filter(b => b !== bookmark);

  // Save the updated bookmarks back to localStorage
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

  // Refresh the display
  displayBookmarks();
}
// Call the function to display bookmarks
displayBookmarks();