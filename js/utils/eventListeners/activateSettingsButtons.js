import getDocumentAreas from "../getDocumentAreas.js";

export default function activateSettingsButtons()
{
    const { settingsOpenButton, settingsCloseButton, settings } = getDocumentAreas();

    settingsOpenButton?.addEventListener("click", () => 
    {
        if (!settings) return;

        settings.style.display = settings.style.display === 'block' ? 'none' : 'block';
    });

    settingsCloseButton?.addEventListener("click", () => 
    {
        if (!settings) return;

        settings.style.display = 'none';
    });
}