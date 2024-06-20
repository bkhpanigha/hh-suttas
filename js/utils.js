const DEFAULT_BOOKMARK_DICT = { bookmarks: { unlabeled: [] } };


// This code enables highlighting of text segments in the sutta based on URL hash ranges.
// For example, accessing the URL 127.0.0.1:8080/?q=mn1#mn1:23.1-mn1:194.6 will highlight the range from mn1:23.1 to mn1:194.6.
// Similarly, accessing 127.0.0.1:8080/?q=mn1#mn1:23.1 will highlight the single segment at mn1:23.1.
function scrollToHash() {
  // TODO deal with the evam case gracefully
  const hash = window.location.hash.substring(1); // Remove the '#' from the hash

  if (hash) {
    // remove all highlights first
    document.querySelectorAll('.highlight').forEach(element => {
      element.classList.remove('highlight');
    });
    const rangeMatch = hash.match(/(.*?):(\d+\.\d+\.\d+|\d+\.\d+)-(.*?):(\d+\.\d+\.\d+|\d+\.\d+)/);
    if (rangeMatch) {
      const [, startIdPrefix, startIdSuffix, endIdPrefix, endIdSuffix] = rangeMatch;
      const startFullId = `${startIdPrefix}:${startIdSuffix}`;
      const endFullId = `${endIdPrefix}:${endIdSuffix}`;
      const startElement = document.getElementById(startFullId);
      const endElement = document.getElementById(endFullId);

      if (startElement && endElement) {
        let highlight = false;
        var segments = document.getElementsByClassName("segment");

        for (const segment of segments) {
          if (segment.id === startFullId) {
            highlight = true;
          }

          if (highlight) {
            segment.classList.add("highlight");
          }

          if (segment.id === endFullId) {
            break;
          }
        }

        startElement.scrollIntoView();
      }
    } else {
      // Handle single element highlighting
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        targetElement.classList.add("highlight")
        targetElement.scrollIntoView();
      }
    }
  }
}

function generateLink(idOrRange) {
  const baseUrl = window.location.origin + window.location.pathname;
  let hash = "#";
  if (typeof idOrRange === "string") {
    hash += idOrRange;
  } else if (Array.isArray(idOrRange) && idOrRange.length === 2) {
    hash += `${idOrRange[0]}-${idOrRange[1]}`;
  } else {
    console.error("Invalid ID or Range format");
    return "";
  }
  return `${baseUrl}?q=${hash.substring(1).split(':')[0]}${hash}`;
}

function changeAcronymNumber(acronym, change) {
  return acronym.replace(/(\D+)(\d+)/, (match, p1, p2) => {
    let changedNumber = parseInt(p2, 10) + change;
    return `${p1}${changedNumber}`;
  });
}
// Function to display the copy button
function showCopyButton(x, y, ids) {
  let copyButton = document.getElementById('copyButton');
  if (!copyButton) {
    copyButton = document.createElement('button');
    copyButton.id = 'copyButton';
    copyButton.textContent = 'Copy Link';
    document.body.appendChild(copyButton);
  }

  // Remove any existing click event listener
  copyButton.removeEventListener('click', copyButton.clickHandler);

  // Create a new click handler with current IDs
  copyButton.clickHandler = function () {
    let link = "";
    if (ids.length > 1) {
      const firstId = ids[0];
      const lastId = ids[ids.length - 1];
      link = generateLink([firstId, lastId].join('-'));
    } else if (ids.length === 1) {
      link = generateLink(ids[0]);
    }
    copyToClipboard(link);
    hideCopyButton();
    hideBookmarkButton();
    clearSelection();
  };

  // Add the new click event listener
  copyButton.addEventListener('click', copyButton.clickHandler);

  copyButton.style.left = x + 'px';
  copyButton.style.top = y + 'px';
  copyButton.style.position = 'absolute';
  copyButton.style.display = 'block';
}

function hideCopyButton() {
  let copyButton = document.getElementById('copyButton');
  if (copyButton) {
    copyButton.style.display = 'none';
  }
}
function showBookmarkButton(x, y, ids) {
  let bookmarkButton = document.getElementById('bookmarkButton');
  if (!bookmarkButton) {
    bookmarkButton = document.createElement('button');
    bookmarkButton.id = 'bookmarkButton';
    bookmarkButton.textContent = 'Bookmark';
    document.body.appendChild(bookmarkButton);
  }

  // Remove any existing click event listener
  bookmarkButton.removeEventListener('click', bookmarkButton.clickHandler);

  bookmarkButton.clickHandler = function () {
    // TODO this is not ideal as it split the bookmarks logic here and in bookmarks.js
    let bookmarksData = JSON.parse(localStorage.getItem('bookmarksData')) || DEFAULT_BOOKMARK_DICT;
    let bookmarks = bookmarksData['bookmarks'];
    if (!bookmarks.hasOwnProperty('unlabeled')) {
      bookmarks.unlabeled = [];
    }
    let hash = "";
    if (ids.length > 1) {
      const firstId = ids[0];
      const lastId = ids[ids.length - 1];
      hash = `${firstId}-${lastId}`;
    } else if (ids.length === 1) {
      hash = ids[0];
    }
    // Check if the hash already exists in bookmarks
    if (!bookmarks.unlabeled.includes(hash)) {
      bookmarks.unlabeled.push(hash);
      bookmarksData['bookmarks'] = bookmarks;
      bookmarksData['updatedAt'] = new Date().toISOString();
      localStorage.setItem('bookmarksData', JSON.stringify(bookmarksData));
      showNotification(`Added ${hash} to <a href="/bookmarks.html">bookmarks</a>`);
    } else {
      showNotification("Section already in bookmarks");
    }
  
    hideBookmarkButton();
    hideCopyButton();
    clearSelection();
  };

  // Add the new click event listener
  bookmarkButton.addEventListener('click', bookmarkButton.clickHandler);

  bookmarkButton.style.left = x + 'px';
  bookmarkButton.style.top = y + 'px';
  bookmarkButton.style.position = 'absolute';
  bookmarkButton.style.display = 'block';
}

function hideBookmarkButton() {
  let bookmarkButton = document.getElementById('bookmarkButton');
  if (bookmarkButton) {
    bookmarkButton.style.display = 'none';
  }
}

function clearSelection() {
  if (window.getSelection) {
    if (window.getSelection().empty) {  // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {  // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {  // IE
    document.selection.empty();
  }
}

function handleTextSelection() {
  const selection = window.getSelection();

  if (!selection.rangeCount || selection.isCollapsed) {
    hideCopyButton();
    hideBookmarkButton();
    return;
  }

  const start = selection.anchorNode.parentNode;
  let end;
  const selectedText = selection.toString();
  const endsWithNewline = selectedText.endsWith('\n') || selectedText.endsWith('\r\n');

  if (endsWithNewline && selection.focusNode.nodeType === 1) {
      end = selection.focusNode.previousElementSibling;
  } else {
    const focusParent = selection.focusNode.parentNode;
    end = focusParent.tagName === 'ARTICLE' ? selection.focusNode : focusParent;
  }

  if (start.classList.contains('comment-text') || end.classList.contains('comment-text')) {
    return; // Selection is within a comment text, do not show copy button
  }

  let segments = [];
  if (start === end) {
    let commonAncestor = start;
    while (commonAncestor) {
      if (commonAncestor.nodeType === Node.ELEMENT_NODE && commonAncestor.classList.contains('segment') && commonAncestor.id) {
        segments = [commonAncestor];
        break;
      }
      commonAncestor = commonAncestor.parentNode;
    }
  } else {
    const range = selection.getRangeAt(0);
    segments = Array.from(range.cloneContents().querySelectorAll('.segment'));
  }

  if (segments.length === 0) {
    return; // No valid segment found
  }

  const ids = segments.map(segment => segment.id);
  const rect = end.getBoundingClientRect();
  showCopyButton(rect.left + window.scrollX, rect.bottom + window.scrollY, ids);
  showBookmarkButton(rect.left + window.scrollX + 72, rect.bottom + window.scrollY, ids); // Adjust position as needed

}

// Function to copy text to the clipboard
function copyToClipboard(text) {
  // Temporarily refocus on the document body
  document.body.focus();
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
    showNotification("Link copied to clipboard");
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}

function showNotification(message, duration = 3000) {
  let notificationBox = document.querySelector('.notification-box');
  if (!notificationBox) {
    notificationBox = document.createElement('div');
    notificationBox.classList.add('notification-box');
    document.body.appendChild(notificationBox);
  }

  notificationBox.innerHTML = message;

  // Show the notification with fade-in effect
  notificationBox.style.display = 'block';
  setTimeout(() => notificationBox.style.opacity = 1, 10); // Slight delay to ensure the element is visible before starting the transition

  // Hide the notification with fade-out effect after 'duration' milliseconds
  setTimeout(() => {
    notificationBox.style.opacity = 0;
    // Wait for the fade-out transition to finish before hiding the element
    setTimeout(() => {
      notificationBox.style.display = 'none';
    }, 500); // This duration should match the transition duration in the CSS
  }, duration);
}

// Add event listener for text selection
document.addEventListener('selectionchange', handleTextSelection);



export { scrollToHash, showNotification, changeAcronymNumber, DEFAULT_BOOKMARK_DICT };
