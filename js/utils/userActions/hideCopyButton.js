export function hideCopyButton() {
    let copyButton = document.getElementById('copyButton');
    if (copyButton) {
      copyButton.style.display = 'none';
    }
  }