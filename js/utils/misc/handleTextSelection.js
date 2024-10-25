import { hideCopyButton } from "../userActions/hideCopyButton.js";
import { hideBookmarkButton } from "../userActions/hideBookmarkButton.js";
import { showBookmarkButton } from "../userActions/showBookmarkButton.js";
import { showCopyButton } from "../navigation/showCopyButton.js";

export function handleTextSelection() {
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
    showCopyButton(rect.left + window.scrollX, rect.bottom + window.scrollY + 5, ids);
    showBookmarkButton(rect.left + window.scrollX + 77, rect.bottom + window.scrollY + 5, ids); // Adjust position as needed
  
}
document.addEventListener('selectionchange', handleTextSelection);