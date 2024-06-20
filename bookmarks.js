import { showNotification } from './js/utils.js';

function getRangeAsString(jsonObj, startKey, endKey) {
  let startKeyReached = false;
  let resultString = '';

  for (const key in jsonObj) {
    if (key === startKey) startKeyReached = true;
    if (startKeyReached) resultString += jsonObj[key];
    if (key === endKey) break;
  }

  return resultString;
}
async function displayBookmarks() {
  // Retrieve bookmarks from localStorage
  const bookmarksDict = JSON.parse(localStorage.getItem('bookmarks'));

  // Check if bookmarks exist
  if (!bookmarksDict) {
    console.error('No bookmarks found in localStorage');
    return;
  }

  // Container to display the bookmarks
  const bookmarksDiv = document.getElementById('bookmarks');
  if (!bookmarksDiv) {
    console.error('No div with id "bookmarks" found');
    return;
  }

  for (const label in bookmarksDict) {
    // Create a collapsible container for each label
    const details = document.createElement('details');
    // const pTag = document.createElement('p');
    const summary = document.createElement('summary');
    summary.textContent = label;
    // Create a delete button for the summary
    if (label !== 'unlabeled') {
      const deleteSummaryButton = document.createElement('button');
      deleteSummaryButton.textContent = 'Delete';
      deleteSummaryButton.style.marginLeft = '10px'; // Add some margin for spacing
      deleteSummaryButton.onclick = () => {
        // Retrieve bookmarks from localStorage
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks'));

        // Delete the label and its bookmarks
        delete bookmarks[label];

        // Save the updated bookmarks back to localStorage
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

        // Refresh the display
        displayPage();
      };

      // Append the delete button to the summary
      summary.appendChild(deleteSummaryButton);
    }
    // TODO make this work with dark mode
    details.appendChild(summary);

    // Process each bookmark
    for (const bookmark of bookmarksDict[label]) {
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
      const filePath = `suttas/translation_en/${book}/${fileIdentifier}_translation-en-anigha.json`;

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
          deleteButton.onclick = () => deleteBookmark(label, bookmark);
          container.appendChild(deleteButton);
          details.appendChild(container);

          // Create a dropdown for labels
          const labelDropdown = document.createElement('select');
          labelDropdown.className = 'label-dropdown';

          // Retrieve existing labels from localStorage
          let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
          let labels = Object.keys(bookmarks);

          // Populate the dropdown with labels
          labels.forEach((label) => {
            const option = document.createElement('option');
            option.value = label;
            option.textContent = label;
            labelDropdown.appendChild(option);
          });

          // Set the current label as the selected option
          labelDropdown.value = label; // Assuming 'unlabeled' is the default label

          // Event listener for label change
          labelDropdown.addEventListener('change', (event) => {
            const newLabel = event.target.value;
            const oldLabel = label; // Assuming 'unlabeled' is the current label
            const bookmarkIndex = bookmarks[oldLabel].indexOf(bookmark);

            if (bookmarkIndex > -1) {
              // Remove bookmark from old label
              bookmarks[oldLabel].splice(bookmarkIndex, 1);

              // Add bookmark to new label
              if (!bookmarks[newLabel]) {
                bookmarks[newLabel] = [];
              }
              bookmarks[newLabel].push(bookmark);

              // Save updated bookmarks to localStorage
              localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

              // Refresh the display
              displayPage();
            }
          });

          container.appendChild(labelDropdown);
          details.appendChild(container);
        } else {
          console.warn(`Key ${key} not found in ${filePath}`);
        }
      } catch (error) {
        console.error(error);
      }
    }

    bookmarksDiv.appendChild(details);
  }
}
function deleteBookmark(label, bookmark) {
  // Retrieve bookmarks from localStorage
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks'));

  // Filter out the bookmark to be deleted
  bookmarks[label] = bookmarks[label].filter((b) => b !== bookmark);

  // Save the updated bookmarks back to localStorage
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

  // Refresh the display
  displayPage();
}

function displayPage() {
  // TODO create a seperate section for the input box
  // Create an input box for new labels
  const bookmarksDiv = document.getElementById('bookmarks');

  bookmarksDiv.innerHTML = '';

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.placeholder = 'Enter new label';
  labelInput.id = 'newLabelInput';
  bookmarksDiv.appendChild(labelInput);

  // Create a button to save the new label
  const saveLabelButton = document.createElement('button');
  saveLabelButton.textContent = 'Save Label';
  bookmarksDiv.appendChild(saveLabelButton);

  // Event listener for the save button
  saveLabelButton.addEventListener('click', () => {
    const newLabel = labelInput.value.trim();
    if (newLabel) {
      // Retrieve existing bookmarks
      const bookmarksDict = JSON.parse(localStorage.getItem('bookmarks')) || {};

      // Add the new label if it doesn't already exist
      if (!bookmarksDict[newLabel]) {
        bookmarksDict[newLabel] = [];
        localStorage.setItem('bookmarks', JSON.stringify(bookmarksDict));
        showNotification(`Added new label: ${newLabel}`);
        displayPage();
      } else {
        showNotification(`Label "${newLabel}" already exists`);
      }

      // Clear the input box
      labelInput.value = '';
    } else {
      showNotification('Label cannot be empty');
    }
  });
  // Call the function to display bookmarks
  displayBookmarks();
}

displayPage();
