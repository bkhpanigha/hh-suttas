import { hideBookmarkButton } from "./hideBookmarkButton.js";
import { hideCopyButton } from "./hideCopyButton.js";
import { clearSelection } from "./clearSelection.js";
import { showNotification } from "./showNotification.js";
import { DEFAULT_BOOKMARK_DICT } from "../misc/default_bookmark_dict.js";

export function showBookmarkButton(x, y, ids) {
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
        hash = `${firstId}_${lastId}`;
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
