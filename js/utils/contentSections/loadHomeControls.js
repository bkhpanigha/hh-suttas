import getDocumentAreas from "../getDocumentAreas.js";

const loadHomeControls = () => {
  const { homeControls } = getDocumentAreas();
  
  homeControls.innerHTML = 
    `<div id="suttasTabSwitcherContainer" class="tab-switch">
      <input id="suttasTabSwitcher" type="checkbox" />
      <label for="suttasTabSwitcher">
        <span>Library</span>
        <span>History</span>
      </label>
    </div>      
    <form id="filter-form">
      <div class="filter-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24">
          <path fill="" d="m2.08 2l6.482 8.101A2 2 0 0 1 9 11.351V18l2-1.5v-5.15a2 2 0 0 1 .438-1.249L17.92 2zm0-2h15.84a2 2 0 0 1 1.561 3.25L13 11.35v5.15a2 2 0 0 1-.8 1.6l-2 1.5A2 2 0 0 1 7 18v-6.65L.519 3.25A2 2 0 0 1 2.08 0"></path>
        </svg>
      </div>
      <input id="filter-bar" type="text" placeholder="Filter by citation or title (English or Pāli)">
    </form>`;
};

export default loadHomeControls;
