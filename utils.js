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
    const rangeMatch = hash.match(/(.*?):(\d+\.\d+)-(.*?):(\d+\.\d+)/);
    if (rangeMatch) {
      const [, startIdPrefix, startIdSuffix, endIdPrefix, endIdSuffix] = rangeMatch;
      const startFullId = `${startIdPrefix}:${startIdSuffix}`;
      const endFullId = `${endIdPrefix}:${endIdSuffix}`;
      const startElement = document.getElementById(startFullId);
      const endElement = document.getElementById(endFullId);

      if (startElement && endElement) {
        let element = startElement;
        let highlight = false;

        // Loop through sibling elements until the end element is reached
        while (element) {
          if (element.id === startFullId) {
            highlight = true;
          }

          if (highlight) {
            element.classList.add("highlight")
          }

          if (element.id === endFullId) {
            break;
          }
          if (element.nextElementSibling) {
            element = element.nextElementSibling;
          }
          else if (parseFloat(startIdSuffix) < parseFloat(endIdSuffix)) {
            element = element.parentNode.nextElementSibling.firstElementChild
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

    copyButton.addEventListener('click', function () {

      let link = "";
      if (ids.length > 1) {
        const firstId = ids[0];
        const lastId = ids[ids.length - 1];
        link = generateLink([firstId, lastId].join('-'));
      } else if (ids.length === 1) {
        link = generateLink(ids[0]);
      } else {
        return;
      }
      copyToClipboard(link);
      hideCopyButton()
    });
  }

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

function handleTextSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.isCollapsed) {
    hideCopyButton();
    return;
  }

  const range = selection.getRangeAt(0);
  let spans = range.cloneContents().querySelectorAll('.segment');
  if (spans.length === 0) {
    spans = [selection.getRangeAt(0).commonAncestorContainer];
  }
  const ids = Array.from(spans).map(span => span.id);
  const rect = range.getBoundingClientRect();
  showCopyButton(rect.left + window.scrollX, rect.bottom + window.scrollY, ids);
}

// Function to copy text to the clipboard
function copyToClipboard(text) {
  // Temporarily refocus on the document body
  document.body.focus();
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
    alert("Link copied to clipboard: " + text);
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}

// Add event listener for text selection
document.addEventListener('mouseup', handleTextSelection);

export { scrollToHash, generateLink, changeAcronymNumber };