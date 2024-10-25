import * as dexie from "./dist/dexie_dist.js"

const db = new Dexie("store");

db.version(1).stores({
  suttas: "id, content",
});

export default db;
