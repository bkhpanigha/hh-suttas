import db from "../dexie/dexie.js";
import suttasCount from '../../python/generated/suttas-count.js';
import hash from '../../python/generated/suttas-database-data-hash.js';

function runImport(isEmpty) {
  return fetch("../../python/generated/suttas-database-data.json")
    .then(response => response.json())
    .then((suttas) => {
      const data = Object.entries(suttas).map(([key, value]) => ({
        id: key,
        value
      }));

      return db.suttas.bulkPut(data).then(() => {
        const logMessage = isEmpty ? "[SUCCESS] Database setup complete" : "[SUCCESS] Database updated.";
        console.log(logMessage);
      });
    })
    .catch((error) => {
      console.error("[ERROR] Failed to load or insert suttas data:", error);
      throw error;
    });
}

export default function updateSuttaDatabase() {
  // First check if the 'hash' table exists in the schema
  if (!db.tables.some(table => table.name === 'hash')) {
    // Create the 'hash' table if it doesn't exist
    db.version(db.verno + 1).stores({
      hash: 'id, value' // Define 'id' as the primary key (without auto-increment)
    });
  }

  // Function to update or create the hash entry
  const updateHashAndRunImport = (isEmpty) => {
    return db.hash.toArray()
      .then(entries => {
        if (entries.length === 0) {
          // No entries - create a new one with an explicit id
          return db.hash.add({ id: 1, value: hash })
            .then(() => runImport(isEmpty));
        } else {
          // An entry exists - check if it's different
          const currentHash = entries[0];
          if (currentHash.value !== hash) {
            // Update the existing hash
            return db.hash.update(currentHash.id, { value: hash })
              .then(() => runImport(isEmpty));
          }
          // If the hash is identical and the database is not empty, no need to import
          if (!isEmpty) {
            console.log("[INFO] Database is up to date. Skipped import.");
            return Promise.resolve();
          }
          return runImport(isEmpty);
        }
      });
  };

  // Check the state of the database
  return db.suttas.count()
    .then((count) => {
      const isEmpty = count === 0;
      const isDataMissing = suttasCount > count;

      if (isEmpty || isDataMissing) {
        return updateHashAndRunImport(isEmpty);
      } else {
        // Even if the database is not empty, still check the hash
        return updateHashAndRunImport(false);
      }
    })
    .catch((error) => {
      console.error("[ERROR] Failed to check data count:",error);
      throw error;
    });
}
