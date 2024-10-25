export function hideBookmarkButton() {
    let bookmarkButton = document.getElementById('bookmarkButton');
    if (bookmarkButton) {
      bookmarkButton.style.display = 'none';
    }
}