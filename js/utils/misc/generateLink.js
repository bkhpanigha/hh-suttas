function extractIdsFromUrl() {
  const urlObj = new URL(window.location.href);
  
  // Use URLSearchParams to fetch 'q' parameter value in URL
  const queryParams = new URLSearchParams(urlObj.search);
  const qValue = queryParams.get('q');
  
  return qValue;
}

export function generateLink(idOrRange) {
  
  const suttaId = extractIdsFromUrl();
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
    return `${baseUrl}?q=${suttaId}${hash}`;
  }