document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('blockifyToggle');
  const excludeForm = document.getElementById('excludeForm');
  const excludedSitesInput = document.getElementById('excludedSites');
  const excludedSitesList = document.getElementById('excludedSitesList');

  chrome.storage.sync.get(['blockifyEnabled', 'excludedSites'], (result) => {
    toggle.checked = result.blockifyEnabled || false;
    renderExcludedSites(result.excludedSites || []);
  });

  toggle.addEventListener('change', () => {
    const isEnabled = toggle.checked;
    chrome.storage.sync.set({ blockifyEnabled: isEnabled });
    chrome.runtime.sendMessage({ action: 'toggleBlockify', value: isEnabled });
  });

  // Handle form submission (Add button or Enter key)
  excludeForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission
    const site = excludedSitesInput.value.trim().toLowerCase();
    if (site) {
      chrome.storage.sync.get(['excludedSites'], (result) => {
        const excludedSites = result.excludedSites || [];
        if (!excludedSites.includes(site)) {
          excludedSites.push(site);
          chrome.storage.sync.set({ excludedSites });
          renderExcludedSites(excludedSites);
          excludedSitesInput.value = '';
        }
      });
    }
  });

  // Function to render excluded sites list
  function renderExcludedSites(sites) {
    excludedSitesList.innerHTML = sites.map(site => `
      <li>
        ${site}
        <button class="remove-btn" data-site="${site}">Remove</button>
      </li>
    `).join('');

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const siteToRemove = this.dataset.site;
        chrome.storage.sync.get(['excludedSites'], (result) => {
          const excludedSites = result.excludedSites.filter(site => site !== siteToRemove);
          chrome.storage.sync.set({ excludedSites });
          renderExcludedSites(excludedSites);
        });
      });
    });
  }
});