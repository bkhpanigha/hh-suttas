import * as dexie from "./dist/dexie_dist.js"

const db = new Dexie("store");

db.version(1).stores({
  suttas_en: "id, sortKey", // Add sortKey as index to easily sort entries
  suttas_pl: "id, sortKey",
  hash: "id, content",
});

export default db;
