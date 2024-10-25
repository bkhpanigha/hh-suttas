import { showNotification } from "../userActions/showNotification.js";

// Function to copy text to the clipboard
export function copyToClipboard(text) {
    // Temporarily refocus on the document body
    document.body.focus();
    navigator.clipboard.writeText(text).then(function () {
      console.log('Async: Copying to clipboard was successful!');
      showNotification("Link copied to clipboard");
    }, function (err) {
      console.error('Async: Could not copy text: ', err);
    });
  }