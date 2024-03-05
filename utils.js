// This code enables highlighting of text segments in the sutta based on URL hash ranges.
// For example, accessing the URL 127.0.0.1:8080/?q=mn1#mn1:23.1-mn1:194.6 will highlight the range from mn1:23.1 to mn1:194.6.
// Similarly, accessing 127.0.0.1:8080/?q=mn1#mn1:23.1 will highlight the single segment at mn1:23.1.

function scrollToHash() {
  const hash = window.location.hash.substring(1); // Remove the '#' from the hash

  if (hash) {
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
            applyHighlightStyle(element);
          }

          if (element.id === endFullId) {
            break;
          }

          element = element.nextElementSibling;
        }

        startElement.scrollIntoView();
      }
    } else {
      // Handle single element highlighting
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        applyHighlightStyle(targetElement);
        targetElement.scrollIntoView();
      }
    }
  }
}

function applyHighlightStyle(element) {
  element.style.color = "#333366";
  element.style.fontWeight = "bold";
  // element.style.padding = "4px 8px";
  // element.style.borderRadius = "4px";
  // element.style.border = "1px solid #ccccff";
  // element.style.boxShadow = "2px 2px 4px #e0e0e0";
  element.style.fontSize = "1.5em";
  // element.style.transition = "background-color 0.3s, color 0.3s";
}

export {scrollToHash};