import { showNotification, DEFAULT_BOOKMARK_DICT } from './js/utils.js';

// TODO check if this is needed or move to utils
const response = await fetch('available_suttas.json');
const availableSuttas = await response.json();
const availableSuttasJson = availableSuttas['available_suttas'];

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
  let bookmarksData = JSON.parse(localStorage.getItem('bookmarksData'));
  // Check if bookmarks exist
  if (!bookmarksData || Object.keys(bookmarksData).length === 0) {
    console.warn('No bookmarksData found in localStorage');
    return;
  }
  const bookmarksDict = bookmarksData.bookmarks;

  // Initialize the detailsState if it doesn't exist
  if (!bookmarksData.detailsState) {
    bookmarksData.detailsState = {};
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
    details.open = bookmarksData.detailsState[label] || false; // Set the open state based on saved data

    // Add event listener to save the open/closed state
    details.addEventListener('toggle', () => {
      bookmarksData.detailsState[label] = details.open;
      localStorage.setItem('bookmarksData', JSON.stringify(bookmarksData));
    });

    const summary = document.createElement('summary');
    summary.textContent = `${label} (${bookmarksDict[label].length})`;
    summary.classList.add('bookmark-text');
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
        bookmarksData['bookmarks'] = bookmarks;
        bookmarksData['updatedAt'] = new Date().toISOString();
        localStorage.setItem('bookmarksData', JSON.stringify(bookmarksData));

        // Refresh the display
        displayPage();
      };

      // Append the delete button to the summary
      summary.appendChild(deleteSummaryButton);
    }
    details.appendChild(summary);

    // Process each bookmark
    for (const bookmark of bookmarksDict[label]) {
      // Extract the file identifier and key
      const [citation, key] = bookmark.toLowerCase().split(':');

      const filePath = availableSuttasJson[citation]['translation_path'];

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
          link.textContent = availableSuttasJson[citation]['id'];
          container.appendChild(link);

          // Create a delete button
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.onclick = () => deleteBookmark(label, bookmark);
          container.appendChild(deleteButton);
          details.appendChild(container);

          // Create a collapsible container for label checkboxes
          const labelDetails = document.createElement('details');
          labelDetails.className = 'label-details';
          labelDetails.classList.add('bookmark-text');

          // Create a summary element for the collapsible container
          const labelSummary = document.createElement('summary');
          labelSummary.textContent = 'Labels';
          labelSummary.classList.add('bookmark-text');
          labelDetails.appendChild(labelSummary);

          // Create a container for the checkboxes
          const labelCheckboxContainer = document.createElement('div');
          labelCheckboxContainer.className = 'label-checkbox-container';

          // Retrieve existing labels from localStorage
          let bookmarksData = JSON.parse(localStorage.getItem('bookmarksData'));
          let bookmarks = bookmarksData.bookmarks;
          const labels = Object.keys(bookmarks);

          // Populate the container with checkboxes for each label
          labels.forEach((label) => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = label;
            checkbox.id = `checkbox-${label}`;
            checkbox.checked = bookmarks[label].includes(bookmark);

            const labelElement = document.createElement('label');
            labelElement.htmlFor = `checkbox-${label}`;
            labelElement.textContent = label;

            // Event listener for checkbox change
            checkbox.addEventListener('change', (event) => {
              const newLabel = event.target.value;
              const isChecked = event.target.checked;

              if (isChecked) {
                // Add bookmark to the new label
                if (!bookmarks[newLabel]) {
                  bookmarks[newLabel] = [];
                }
                bookmarks[newLabel].push(bookmark);
              } else {
                // Remove bookmark from the label
                bookmarks[newLabel] = bookmarks[newLabel].filter((b) => b !== bookmark);
              }

              // Save updated bookmarks to localStorage
              bookmarksData['bookmarks'] = bookmarks;
              bookmarksData['updatedAt'] = new Date().toISOString();
              localStorage.setItem('bookmarksData', JSON.stringify(bookmarksData));

              // Refresh the display
              displayPage();
            });

            labelCheckboxContainer.appendChild(checkbox);
            labelCheckboxContainer.appendChild(labelElement);
          });

          // Append the checkbox container to the collapsible container
          labelDetails.appendChild(labelCheckboxContainer);
          container.appendChild(labelDetails);
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
  let bookmarksData = JSON.parse(localStorage.getItem('bookmarksData'));
  let bookmarks = bookmarksData.bookmarks;

  // Filter out the bookmark to be deleted
  bookmarks[label] = bookmarks[label].filter((b) => b !== bookmark);

  // Save the updated bookmarks back to localStorage
  // TODO update updatedAt
  bookmarksData[bookmarks] = bookmarks;
  localStorage.setItem('bookmarksData', JSON.stringify(bookmarksData));

  // Refresh the display
  displayPage();
}

function displayPage() {
  // TODO create a separate section for the input box
  const bookmarksDiv = document.getElementById('bookmarks');

  bookmarksDiv.innerHTML = '';

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.placeholder = 'Enter new label';
  labelInput.id = 'newLabelInput';
  bookmarksDiv.appendChild(labelInput);

  const saveLabelButton = document.createElement('button');
  saveLabelButton.textContent = 'Save Label';
  bookmarksDiv.appendChild(saveLabelButton);

  // Event listener for the save button
  saveLabelButton.addEventListener('click', () => {
    const newLabel = labelInput.value.trim();
    if (newLabel) {
      let bookmarksData = JSON.parse(localStorage.getItem('bookmarksData')) || DEFAULT_BOOKMARK_DICT;
      const bookmarksDict = bookmarksData.bookmarks;

      if (!bookmarksDict[newLabel]) {
        bookmarksDict[newLabel] = [];
        bookmarksData['bookmarks'] = bookmarksDict;
        localStorage.setItem('bookmarksData', JSON.stringify(bookmarksData));
        showNotification(`Added new label: ${newLabel}`);
        displayPage();
      } else {
        showNotification(`Label "${newLabel}" already exists`);
      }

      labelInput.value = '';
    } else {
      showNotification('Label cannot be empty');
    }
  });

  // Create download button
  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download Bookmarks';
  bookmarksDiv.appendChild(downloadButton);

  downloadButton.addEventListener('click', () => {
    const bookmarksData = localStorage.getItem('bookmarksData');
    const blob = new Blob([bookmarksData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarksData.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Create upload button
  const uploadButton = document.createElement('button');
  uploadButton.textContent = 'Upload Bookmarks';
  bookmarksDiv.appendChild(uploadButton);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';
  fileInput.style.display = 'none';
  bookmarksDiv.appendChild(fileInput);

  uploadButton.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const bookmarksData = JSON.parse(e.target.result);
          localStorage.setItem('bookmarksData', JSON.stringify(bookmarksData));
          showNotification('Bookmarks uploaded successfully');
          displayPage();
        } catch (error) {
          showNotification('Failed to upload bookmarks: Invalid JSON');
        }
      };
      reader.readAsText(file);
    }
  });

  // Call the function to display bookmarks
  displayBookmarks();
}

displayPage();
