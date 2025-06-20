import db from '../../dexie/dexie.js';
import getDocumentAreas from '../getDocumentAreas.js';

export default function activateResetButton()
{
    const { resetButton } = getDocumentAreas();

    resetButton?.addEventListener("click", function () 
    {
        db.delete().then(() => {
            console.log("[SUCCESS] Database deleted");
            localStorage.clear();
            window.location.href = "/";
        }).catch((error) => 
        {
            console.error("[ERROR] Could not delete database:", error);
        })
    });
}