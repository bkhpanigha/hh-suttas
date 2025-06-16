/**
 * 
 * Modifying Existing Features:
 * It may seem daunting to add new features to this at first, but it's actually 
 * quite straightforward.  If we are modifying an existing feature, we can 
 * quickly locate the relevant code, which will be present within its own file -- 
 * without any confusing fluff.  
 * 
 * Adding New Features: 
 * From the root, (here) we can determine whether our desired feature logically 
 * fits into any of the operations currently present.  If not, 
 * simply create a new file within one of the existing utils folders (or a new 
 * child folder if necessary) and import the file following the syntax we see here.
 * Sometimes, a feature will be an aggregation of several sub-features (ie; activateEventListeners) 
 * in such a case, handling sub-processes is just a recursive step of the same process within the new folder,
 * where we aggregate those related tasks in a sub-folder and then connect them within 
 * our parent component, which is linked here.  (This will make perfect sense if you visit the 
 * activateEventListeners file). 
 * 
 * The reasoning behind this organizational structure:
 * The main idea is to keep the index.js 
 * file completely free of real logic, with the purpose of each operation being 
 * self-evident from their function names.  This way, any new developer 
 * can just visit this file and see everything that is going on in the application, 
 * making it super easy to work on the project.  The value of this change is 
 * evident if you consider what a new developer would see in the previous version,
 * which didn't provide any clear description of what was happening within the app.
 * It would take way more time and effort to figure out what was going on before 
 * they could contribute. They would also be much more likely to make a mistake or
 * replicate existing logic, which is never ideal.  
 * 
 * Tip: 
 * Using VS Code, you can right click any function and then click "Go To Definition"
 * this will show you exactly where it is defined elsewhere in the code, which makes 
 * navigation super easy.  Additionally, you can type CTRL+LSHFT+F to search for 
 * a particular function instance.  You can also right click and select "Find All References" 
 * to see where a function is used in the code base.
 * 
 */

import loadWhatsNewArea from "./js/utils/contentSections/loadWhatsNewArea.js";
import loadHomeControls from "./js/utils/contentSections/loadHomeControls.js";
import { displaySuttasLibrary } from "./js/utils/contentSections/displaySuttas.js";
import { activateEventListeners } from "./js/utils/loadContent/activateEventListeners.js";
import { fetchAvailableSuttas } from "./js/utils/loadContent/fetchAvailableSuttas.js";
import { toggleTheme } from "./js/utils/misc/toggleTheme.js";
import { buildSutta } from "./js/utils/loadContent/buildSutta.js";
import updateSuttaDatabase from './js/database/updateSuttaDatabase.js';
import { checkPaliUrlParam } from './js/utils/navigation/checkPaliUrlParam.js';
import { preventFlashing } from './js/utils/navigation/preventFlashing.js';
import { scrollToHash } from "./js/utils/navigation/scrollToHash.js";

// Wait for DOM to be fully loaded -- prevents funny business
document.addEventListener('DOMContentLoaded', async function() {
  try {
      //Set up data
      const initialThemeSetting = localStorage.theme === "dark";
      const availableSuttasJson = await fetchAvailableSuttas();

      // Add changes to document to improve experience for mobile
      if (window.innerWidth < 1000) {
        document.body.style.paddingTop = "50px";
        const appContent = document.getElementById("app-content");
        if (appContent) {
          appContent.style.paddingTop = 0;
        }
      }
      
      // Load settings state
      document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
        const settingKey = checkbox.id;
        const storedValue = localStorage.getItem(settingKey);
	      if (storedValue?.match(/show|dark|true/)) {
		      checkbox.checked = true;
	      }
      });

      // Initialize based on URL or default content
      if (document.location.search) {
          const slug = document.location.search.replace("?q=", "").split("&")[0].replace(/\s/g, "").replace(/%20/g, "");
          await buildSutta(slug, availableSuttasJson); //  Wait for buildSutta to end
          checkPaliUrlParam();
      } else if (window.location.pathname === "/") {
          await buildSutta(null, null); // Wait here too
          displaySuttasLibrary(availableSuttasJson);
          loadWhatsNewArea(availableSuttasJson);
          loadHomeControls();
      }

      // Additional setup steps
      updateSuttaDatabase();
      activateEventListeners(availableSuttasJson);
      toggleTheme(initialThemeSetting);
      
      // Now we can reveal the content
      preventFlashing();
      scrollToHash();

  } catch (error) {
      console.error('[ERROR] Something went wrong:', error);
      // If error, we still display the content
      preventFlashing();
  }
});
