// ============================================================
// app.js — Application Bootstrap
// Initializes all modules and wires up global UI behavior
// ============================================================

'use strict';

(function initApp() {
  const { $ } = window.StyleAgentUtils;
  const { showToast } = window.Renderer;

  // ── Initialize Core Modules ────────────────────────────────
  window.ThemeManager.init();
  window.Chat.init();

  // ── Sidebar Toggle (Desktop) ───────────────────────────────
  const sidebar      = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');

  // Desktop sidebar collapse
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // Mobile sidebar open/close
  let overlay = null;

  function openMobileSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('mobile-open');

    // Create overlay
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay visible';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    overlay.addEventListener('click', closeMobileSidebar);
  }

  function closeMobileSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('mobile-open');
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
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
  const modalBackdrop = document.getElementById('modal-backdrop');

  function openModal() {
    if (settingsModal) settingsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (settingsModal) settingsModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (settingsBtn) settingsBtn.addEventListener('click', openModal);
  if (closeSettings) closeSettings.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeMobileSidebar();
    }
  });

  // ── Backend Health Check ───────────────────────────────────
  // Checks if the server is reachable on load
  window.API.healthCheck().then((ok) => {
    if (!ok) {
      showToast('Cannot reach StyleAgent server. Is it running?', 'error', 6000);
    }
  });

  // ── Color swatch copy-hex on click ────────────────────────
  // Delegated event listener for dynamically created swatches
  document.getElementById('messages-container')?.addEventListener('click', async (e) => {
    const swatch = e.target.closest('.color-swatch');
    if (swatch) {
      const hex = swatch.style.backgroundColor;
      // Try to find hex from the chip's title
      const chip = swatch.closest('.color-chip');
      const title = chip?.getAttribute('title') || '';
      const hexMatch = title.match(/#[0-9A-Fa-f]{3,8}/);
      const textToCopy = hexMatch ? hexMatch[0] : hex;

      await window.StyleAgentUtils.copyToClipboard(textToCopy);
      showToast(`Copied ${textToCopy} to clipboard!`, 'success', 2000);
    }
  });

  console.log(
    '%c StyleAgent v1.0 %c AI Fashion Stylist Ready ',
    'background: #8B5CF6; color: white; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
    'background: #06B6D4; color: white; padding: 4px 8px; border-radius: 0 4px 4px 0;'
  );
})();
