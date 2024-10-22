import db from "../dexie/dexie.js";
import importLinesCount from '../../python-generated/suttas-count.js'

export default function updateSuttaDatabase()
{
  db.suttas.count().then((count) => {
    const isEmpty = count === 0;
    const isDataMissing = importLinesCount > count;
  
    if (isEmpty || isDataMissing) {
      fetch("./python-generated/suttas-database-data.json").then(response => response.json()).then((suttas) => {
        let suttasData = suttas;
  
        const data = Object.entries(suttasData).map(([key, value]) => ({
          id: key,
          value
        }));
  
        db.suttas.bulkPut(data).then(() => {
          const logMessage = isEmpty ? "[SUCCESS] Database setup complete" : "[SUCCESS] Database updated.";
          console.log(logMessage);
        }).catch((error) => {
          console.error("[ERROR] Failed to insert data into database:", error);
        });
      }).catch((error) => {
        console.error("[ERROR] Failed to load suttas data:", error);
      });
  
    } else {
      console.log("[INFO] Database is up to date. Skipped import.");
    }
  }).catch((error) => {
    console.error("[ERROR] Failed to check data count:", error);
  });
}