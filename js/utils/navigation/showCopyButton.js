import { generateLink } from "../misc/generateLink.js";
import { hideCopyButton } from "../userActions/hideCopyButton.js";
import { copyToClipboard } from "../../utils/misc/copyToClipboard.js";
import { hideBookmarkButton } from "../userActions/hideBookmarkButton.js";
import { clearSelection } from "../userActions/clearSelection.js";

// Function to display the copy button
export function showCopyButton(x, y, ids) {
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
        link = generateLink([firstId, lastId].join('_'));
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
