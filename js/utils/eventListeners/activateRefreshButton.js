import db from '../../dexie/dexie.js';

export default function activateRefreshButton()
{
    const refreshButton = document.getElementById("hardRefresh");
    refreshButton.addEventListener("click", function () 
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