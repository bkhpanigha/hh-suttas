import { loadWhatsNewArea } from "./js/utils/contentSections/loadWhatsNewArea.js";
import { displaySuttas } from "./js/utils/contentSections/displaySuttas.js";
import { activateEventListeners } from "./js/utils/loadContent/activateEventListeners.js";
import { fetchAvailableSuttas } from "./js/utils/loadContent/fetchAvailableSuttas.js";
import initializeSideBySide from "./js/utils/loadContent/initializeSidebyside.js";
import { toggleTheme } from "./js/utils/misc/toggleTheme.js";
import { buildSutta } from "./js/utils/loadContent/buildSutta.js";
import { handleFetchSuttaTranslations } from "./js/utils/async/handleFetchSuttaTranslations.js";
import updateSuttaDatabase from './js/database/updateSuttaDatabase.js';



// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
  try {
      // Fetch data and initialize app
      const initialThemeSetting = localStorage.theme === "dark";

      const availableSuttasJson = await fetchAvailableSuttas();
      activateEventListeners(availableSuttasJson);

      // Initialize based on URL or default content
      if (document.location.search) {
          const slug = document.location.search.replace("?q=", "").replace(/\s/g, "").replace(/%20/g, "");
          buildSutta(slug, availableSuttasJson);
      } else {
          displaySuttas(availableSuttasJson);
          loadWhatsNewArea(availableSuttasJson);
      }

      // Additional setup steps
      await handleFetchSuttaTranslations();
      updateSuttaDatabase();
      initializeSideBySide();
      toggleTheme(initialThemeSetting);

      // Remove the hidden class once everything is done
      document.getElementById('appbody').classList.remove('hidden');

  } catch (error) {
      console.error('[ERROR] Something went wrong:', error);

      // If something fails, still reveal the default content
      document.getElementById('body').classList.remove('hidden');
  }
});