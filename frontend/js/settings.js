// ============================================================
// settings.js — Settings Modal Tabs & Theme Toggle Logic
// ============================================================

'use strict';

const Settings = (() => {

  function switchTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.settings-tab-content').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
  }

  function init() {
    // Tab switching
    document.querySelectorAll('.settings-tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Theme toggle buttons
    const darkBtn  = document.getElementById('theme-dark-btn');
    const lightBtn = document.getElementById('theme-light-btn');

    function updateThemeBtns(theme) {
      if (darkBtn)  darkBtn.classList.toggle('active', theme === 'dark');
      if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');
    }

    // Sync on open
    const savedTheme = document.documentElement.dataset.theme || 'dark';
    updateThemeBtns(savedTheme);

    if (darkBtn) {
      darkBtn.addEventListener('click', () => {
        document.documentElement.dataset.theme = 'dark';
        localStorage.setItem('theme', 'dark');
        updateThemeBtns('dark');
      });
    }
    if (lightBtn) {
      lightBtn.addEventListener('click', () => {
        document.documentElement.dataset.theme = 'light';
        localStorage.setItem('theme', 'light');
        updateThemeBtns('light');
      });
    }
  }

  return { init };
})();

window.Settings = Settings;

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  if (window.Settings) Settings.init();
});
