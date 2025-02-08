let fuse = null;

const fuseOptions = {
  includeScore: true,
  useExtendedSearch: true,
  shouldSort: false,
  keys: ['combination'],
};

export async function createFuseSearch(availableSuttasJson) {
  // Combine all values in a single field so user can search across multiple fields
  const searchDict = Object.entries(availableSuttasJson).map(([sutta_id, sutta_details]) => {
    // Declare search fields here
    const sutta_details_without_fp = (({ id, title, pali_title, heading }) => ({ id, title, pali_title, heading }))(sutta_details);
    
    sutta_details_without_fp['citation'] = sutta_id;
    // Combine values into a single string for searching
    const combination = Object.values(sutta_details_without_fp)
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Normalize Pali text for searching
    
    // Return new object with "combination" key added
    return {
      ...sutta_details_without_fp,
      combination,
    };
  });

  // Initialize Fuse.js with the constructed search dictionary and options
  fuse = new Fuse(searchDict, fuseOptions);
  return fuse;
}

// Export a getter function to access the initialized Fuse instance
export function getFuseInstance() {
  if (!fuse) {
    throw new Error("Fuse instance is not initialized. Call createFuseSearch() first.");
  }
  return fuse;
}
