import Fuse from "/js/fuse.js";
import { createFuseSearch, getFuseInstance } from "../misc/createFuseSearch.js";

export default async function initializeFuse(availableSuttasJson) {
  await createFuseSearch(availableSuttasJson); // Initialize Fuse.js
  console.log("[INFO] Fuse initialized");
}
