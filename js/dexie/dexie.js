const db = new Dexie("store");

db.version(1).stores({
  suttas: "id, content",
});

export default db;
