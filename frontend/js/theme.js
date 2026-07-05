// ============================================================
// theme.js — Dark / Light Theme Manager
// ============================================================

'use strict';

const ThemeManager = (() => {
  const STORAGE_KEY = 'styleagent-theme';

  // Get saved theme or default to dark
  function getSavedTheme() {
    return 'dark'; // Hardcoded to dark mode per user request
  }

  // Apply theme to <html> element
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Update theme toggle button
    const icon = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    const darkBtn = document.getElementById('dark-mode-btn');
    const lightBtn = document.getElementById('light-mode-btn');

    if (theme === 'dark') {
      if (icon) { icon.className = 'bx bx-moon'; }
      if (label) label.textContent = 'Dark Mode';
      if (darkBtn) { darkBtn.classList.add('active'); darkBtn.setAttribute('aria-pressed', 'true'); }
      if (lightBtn) { lightBtn.classList.remove('active'); lightBtn.setAttribute('aria-pressed', 'false'); }
    } else {
      if (icon) { icon.className = 'bx bx-sun'; }
      if (label) label.textContent = 'Light Mode';
      if (lightBtn) { lightBtn.classList.add('active'); lightBtn.setAttribute('aria-pressed', 'true'); }
      if (darkBtn) { darkBtn.classList.remove('active'); darkBtn.setAttribute('aria-pressed', 'false'); }
    }

    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Toggle between dark and light
  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Initialize on page load
  function init() {
    const saved = getSavedTheme();
    applyTheme(saved);

    // Sidebar theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggle);
    }

    // Settings modal buttons
    const darkBtn = document.getElementById('dark-mode-btn');
    const lightBtn = document.getElementById('light-mode-btn');
    if (darkBtn) darkBtn.addEventListener('click', () => applyTheme('dark'));
    if (lightBtn) lightBtn.addEventListener('click', () => applyTheme('light'));
  }

  return { init, applyTheme, toggle, getSavedTheme };
})();

window.ThemeManager = ThemeManager;
