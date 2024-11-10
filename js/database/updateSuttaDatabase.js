import db from "../dexie/dexie.js";
import suttasCount from '../../python/generated/suttas-count.js';
import hash from '../../python/generated/suttas-database-data-hash.js';

function generateSortKey(id) {
  let prefix;
  if (id.startsWith("dhp") 
   || id.startsWith("iti") 
   || id.startsWith("snp") 
   || id.startsWith("thag") 
   || id.startsWith("thig") 
   || id.startsWith("ud")) 
    prefix = "5";
  else if (id.startsWith("dn")) prefix = "1";
  else if (id.startsWith("mn")) prefix = "2";
  else if (id.startsWith("sn")) prefix = "3";
  else if (id.startsWith("an")) prefix = "4";
  else prefix = "9";

  const paddedId = id.match(/\d+|\D+/g)
    .map(chunk => isNaN(chunk) ? chunk : chunk.padStart(4, '0'))
    .join('');

  return prefix + paddedId;
}

function ensureTrailingSpace(translations) {
  if (!translations) return null;
  
  // Create a new object to store modified translations
  const modifiedTranslations = {};
  
  // Iterate through each key-value pair in the translations object
  Object.entries(translations).forEach(([key, value]) => {
    if (typeof value === 'string') {
      modifiedTranslations[key] = value.endsWith(' ') ? value : value + ' ';
    } else {
      modifiedTranslations[key] = value;
    }
  });
  
  return modifiedTranslations;
}

function runImport(isEmpty) {
  return fetch("../../python/generated/suttas-database-data.json")
    .then(response => response.json())
    .then((suttas) => {
      const dataEn = [];
      const dataPl = [];

      Object.entries(suttas).forEach(([key, value]) => {
        const enEntry = {
          id: key,
          translation_en_anigha: ensureTrailingSpace(value.translation_en_anigha),
          heading: value.heading || null,
          comment: value.comment || null,
          sortKey: generateSortKey(key),
        };

        const plEntry = {
          id: key,
          root_pli_ms: value.root_pli_ms || null,
          sortKey: generateSortKey(key),
        };

        dataEn.push(enEntry);
        dataPl.push(plEntry);
      });

      return Promise.all([
        db.suttas_en.bulkPut(dataEn),
        db.suttas_pl.bulkPut(dataPl)
      ]).then(() => {
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
  // Check if schema needs updating
  const needsSchemaUpdate = db.tables.some(table => table.name === 'suttas');
  
  if (needsSchemaUpdate) {
    // Update schema to remove 'suttas' and add new tables
    db.version(db.verno + 1).stores({
      suttas: null, // This will delete the 'suttas' table
      suttas_en: "id, sortKey",
      suttas_pl: "id, sortKey"
    });
  }

  // Check if hash table needs to be created
  if (!db.tables.some(table => table.name === 'hash')) {
    // Create the 'hash' table if it doesn't exist
    db.version(db.verno + 1).stores({
      hash: 'id, value'
    });
  }

  const updateHashAndRunImport = (isEmpty) => {
    return db.hash.toArray()
      .then(entries => {
        if (entries.length === 0) {
          return db.hash.add({ id: 1, value: hash })
            .then(() => runImport(isEmpty));
        } else {
          const currentHash = entries[0];
          if (currentHash.value !== hash) {
            return db.hash.update(currentHash.id, { value: hash })
              .then(() => runImport(isEmpty));
          }
          if (!isEmpty) {
            console.log("[INFO] Database is up to date. Skipped import.");
            return Promise.resolve();
          }
          return runImport(isEmpty);
        }
      });
  };

  // Check the state of the database using suttas_en table
  return db.suttas_en.count()
    .then((count) => {
      const isEmpty = count === 0;
      const isDataMissing = suttasCount > count;

      if (isEmpty || isDataMissing) {
        return updateHashAndRunImport(isEmpty);
      } else {
        return updateHashAndRunImport(false);
      }
    })
    .catch((error) => {
      console.error("[ERROR] Failed to check data count:", error);
      throw error;
    });
}