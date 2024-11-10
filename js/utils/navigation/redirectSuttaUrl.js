// Function to check if a string matches a valid sutta format
function isSuttaReference(str) {
  // Matches formats like mn1, an1.51-61, sn12.67, thag1.21, snp4.1, iti80, etc.
  const suttaPattern = /^(mn|an|sn|dn|thag|snp|iti)\d+(\.\d+(-\d+)?)?$/i;
  return suttaPattern.test(str);
}

// Function to check if a string matches a valid verse format
function isVerseReference(str) {
  // Matches formats like mn1:1.3, sn36.6:6.5, thag2.34:1.4, etc.
  const versePattern = /^(mn|an|sn|dn|thag|snp|iti)\d+(\.\d+)?:\d+(\.\d+)?$/i;
  return versePattern.test(str);
}

// Function to transform URLs
export function redirectSuttaUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Checks if the URL has a fragment (#)
    if (!urlObj.hash) {
      return url;
    }

    // Removes the # from the fragment
    let fragment = urlObj.hash.substring(1);
    
    // Checks if there is a dash in the fragment
    if (!fragment.includes('-')) {
      return url;
    }

    // Splits the verse references
    const [start, end] = fragment.split('-');
    
    // Checks if both parts are valid verse references
    if (!isVerseReference(start) || !isVerseReference(end)) {
      return url;
    }

    // Replaces the dash with an underscore
    urlObj.hash = `#${fragment.replace('-', '_')}`;
    
    return urlObj.toString();
  } catch (e) {
    // In case of an invalid URL, returns the original URL
    return url;
  }
}
