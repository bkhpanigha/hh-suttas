import { getFuseInstance } from "../misc/createFuseSearch.js";

export function filterSuttas(pattern) {
  const fuse = getFuseInstance();
  if (!fuse) {
    pattern = ""
  }; // if Fuse isn't initialized, return empty array

  pattern = pattern.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Convert pali letters in latin letters to match pali_title in available_suttas.json
  pattern = pattern.replace(/\s+/g, ' ') // Removes multiple spaces
    .replace(/(^|\s)/g, " '");

  let results = fuse.search(pattern).reduce((acc, result) => {
    acc[result.item.id] = result.item;
    return acc;
  }, {});

  // join up the id with the titles to be displayed
  return results;
}
