export async function createFuseSearch(availableSuttasJson) {
	//Combine all values in a single field so user can do search on multiple fields
	let searchDict = Object.entries(availableSuttasJson).map(([sutta_id, sutta_details]) => {
		// Declare search fields here
		let sutta_details_without_fp = (({ id, title, pali_title, heading}) => ({ id, title, pali_title, heading}))(sutta_details);
		
		sutta_details_without_fp['citation'] = sutta_id;
		// Get every element's values and combine them with a white space
		const combination = Object.values(sutta_details_without_fp).join(' ')
		  .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); //pali normalized in latin for search to work on headings containing pali
		
		// Return new object with "combination" key added
		return {
		  ...sutta_details_without_fp,
		  combination: combination
		};
	});
	
	fuse = new Fuse(searchDict, fuseOptions);
	return fuse
}

let fuseOptions = {
  includeScore: true,
  useExtendedSearch: true,
  shouldSort: false,
  keys: ['combination'],
};
