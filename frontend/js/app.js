// ============================================================
// app.js — Application Bootstrap
// Initializes all modules and wires up global UI behavior
// ============================================================

'use strict';

const App = (() => {
  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;

    const { showToast } = window.Renderer;

    // ── Initialize Core Modules ────────────────────────────────
    window.ThemeManager.init();
    window.Chat.init();

    // ── Sidebar Toggle ─────────────────────────────────────────
    const sidebar       = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    let overlay = null;

    function openMobileSidebar() {
      if (!sidebar) return;
      sidebar.classList.add('mobile-open');
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay visible';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
      overlay.addEventListener('click', closeMobileSidebar);
    }

    function closeMobileSidebar() {
      if (!sidebar) return;
      sidebar.classList.remove('mobile-open');
      if (overlay) { overlay.remove(); overlay = null; }
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        if (sidebar && sidebar.classList.contains('mobile-open')) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      });
    }

    // ── Settings Modal ─────────────────────────────────────────
    const settingsBtn   = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');

    function openModal() {
      if (settingsModal) {
        settingsModal.classList.remove('hidden');
        settingsModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeModal() {
      if (settingsModal) {
        settingsModal.classList.add('hidden');
        settingsModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }

    if (settingsBtn)   settingsBtn.addEventListener('click', openModal);
    if (closeSettings) closeSettings.addEventListener('click', closeModal);

    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeModal(); closeMobileSidebar(); }
    });

    // ── Backend Health Check ───────────────────────────────────
    window.API.healthCheck().then((ok) => {
      if (!ok) showToast('Cannot reach StyleAgent server. Is it running?', 'error', 6000);
    });

    console.log(
      '%c StyleAgent v1.5-Pro %c Ready ',
      'background: #6366F1; color: white; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
      'background: #10B981; color: white; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );
  }

  return { init };
})();

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
