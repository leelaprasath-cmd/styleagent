// ============================================================
// renderer.js — Response Rendering Engine
// Converts AI responses into beautiful HTML cards.
// ============================================================

'use strict';

const Renderer = (() => {
  const { formatTime, escapeHtml, copyToClipboard } = window.StyleAgentUtils;

  /**
   * Renders a star rating (out of 5).
   * @param {number} rating - e.g. 4.5
   * @returns {string} - HTML string
   */
  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    let stars = '';
    for (let i = 0; i < full; i++) stars += '<i class="bx bxs-star star"></i>';
    if (half) stars += '<i class="bx bxs-star-half star half"></i>';
    for (let i = 0; i < empty; i++) stars += '<i class="bx bx-star star empty"></i>';
    return stars;
  }

  /**
   * Renders the main outfit recommendation card.
   * @param {object} data - Parsed JSON from the AI
   * @returns {string} - HTML string
   */
  function renderOutfitCard(data) {
    const {
      greeting = '',
      outfit = {},
      whyItWorks = '',
      stylingTips = [],
      alternatives = [],
      colorPalette = [],
      stylingNote = '',
      confidenceScore = 0,
      fashionRating = 0,
    } = data;

    // Build outfit items
    const outfitItems = [
      { icon: '👔', label: 'Top', value: outfit.top },
      { icon: '👖', label: 'Bottom', value: outfit.bottom },
      { icon: '👟', label: 'Shoes', value: outfit.shoes },
      { icon: '🧥', label: 'Outerwear', value: outfit.outerwear },
    ]
      .filter((item) => item.value && item.value !== 'null' && item.value !== null)
      .map(
        (item) => `
        <div class="outfit-item">
          <span class="item-icon" aria-hidden="true">${item.icon}</span>
          <div>
            <div class="item-label">${item.label}</div>
            <div class="item-value">${escapeHtml(item.value)}</div>
          </div>
        </div>`
      )
      .join('');

    // Accessories
    const accessoriesHtml =
      outfit.accessories && outfit.accessories.length
        ? `
        <div class="outfit-section">
          <div class="section-title"><i class="bx bx-diamond" aria-hidden="true"></i> Accessories</div>
          <div class="accessories-list">
            ${outfit.accessories.map((a) => `<span class="accessory-tag">${escapeHtml(a)}</span>`).join('')}
          </div>
        </div>`
        : '';

    // Styling Tips
    const tipsHtml =
      stylingTips.length
        ? `
        <div class="tips-section">
          <div class="section-title"><i class="bx bx-bulb" aria-hidden="true"></i> Styling Tips</div>
          <div class="tips-list">
            ${stylingTips
              .map(
                (tip, i) => `
              <div class="tip-item">
                <div class="tip-number" aria-hidden="true">${i + 1}</div>
                <span>${escapeHtml(tip)}</span>
              </div>`
              )
              .join('')}
          </div>
        </div>`
        : '';

    // Color Palette
    const paletteHtml =
      colorPalette.length
        ? `
        <div class="palette-section">
          <div class="section-title"><i class="bx bx-palette" aria-hidden="true"></i> Color Palette</div>
          <div class="color-palette" role="list">
            ${colorPalette
              .map(
                (c) => `
              <div class="color-chip" role="listitem" title="${escapeHtml(c.name)} — ${escapeHtml(c.hex)}">
                <div class="color-swatch" style="background: ${escapeHtml(c.hex)}" aria-label="${escapeHtml(c.name)}"></div>
                <div class="color-name">${escapeHtml(c.name)}</div>
                <div class="color-role">${escapeHtml(c.role || '')}</div>
              </div>`
              )
              .join('')}
          </div>
        </div>`
        : '';

    // Alternatives
    const alternativesHtml =
      alternatives.length
        ? `
        <div class="alternatives-section">
          <div class="section-title"><i class="bx bx-shuffle" aria-hidden="true"></i> Alternative Looks</div>
          <div class="alternatives-list">
            ${alternatives
              .map(
                (alt) => `
              <div class="alternative-item">
                <div class="alt-icon" aria-hidden="true"><i class="bx bx-hanger"></i></div>
                <div>
                  <div class="alt-name">${escapeHtml(alt.name || '')}</div>
                  <div class="alt-desc">${escapeHtml(alt.description || '')}</div>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>`
        : '';

    // Styling Note
    const noteHtml = stylingNote
      ? `<div class="styling-note"><i class="bx bx-sparkles" aria-hidden="true"></i><span>${escapeHtml(stylingNote)}</span></div>`
      : '';

    return `
    <div class="outfit-card" role="article" aria-label="Outfit recommendation">
      <!-- Header -->
      <div class="card-header">
        <div class="card-header-left">
          <div class="card-icon" aria-hidden="true"><i class="bx bx-hanger"></i></div>
          <div>
            <div class="card-title">Outfit Recommendation</div>
            <div class="card-subtitle">Personalized by StyleAgent</div>
          </div>
        </div>
        <div class="card-scores">
          <div class="confidence-badge" title="AI confidence score">
            <div class="confidence-number">${confidenceScore}%</div>
            <div class="confidence-label">Match</div>
          </div>
          <div class="star-rating" aria-label="Fashion rating ${fashionRating} out of 5">
            ${renderStars(fashionRating)}
          </div>
        </div>
      </div>

      <!-- Greeting -->
      ${greeting ? `<div class="card-greeting">"${escapeHtml(greeting)}"</div>` : ''}

      <!-- Outfit Items -->
      <div class="outfit-section">
        <div class="section-title"><i class="bx bx-closet" aria-hidden="true"></i> The Outfit</div>
        <div class="outfit-grid">${outfitItems}</div>
      </div>

      <!-- Accessories -->
      ${accessoriesHtml}

      <!-- Why It Works -->
      ${whyItWorks ? `
      <div class="why-section">
        <div class="section-title"><i class="bx bx-info-circle" aria-hidden="true"></i> Why It Works</div>
        <div class="why-text">${escapeHtml(whyItWorks)}</div>
      </div>` : ''}

      <!-- Styling Tips -->
      ${tipsHtml}

      <!-- Color Palette -->
      ${paletteHtml}

      <!-- Alternatives -->
      ${alternativesHtml}

      <!-- Styling Note -->
      ${noteHtml}
    </div>`;
  }

  /**
   * Renders a user message bubble.
   * @param {string} content
   * @returns {string}
   */
  function renderUserMessage(content) {
    return `
    <div class="message-user" role="listitem">
      <div class="bubble" aria-label="Your message">${escapeHtml(content)}</div>
    </div>`;
  }

  /**
   * Renders an AI message — either a card or a conversational bubble.
   * @param {object} response - Parsed agent response
   * @param {string} rawContent - Raw text for copy button
   * @returns {string}
   */
  function renderAIMessage(response, rawContent = '') {
    let innerContent = '';
    const text = response.message || rawContent || '';

    if (response.type === 'off_topic') {
      innerContent = `<div class="ai-bubble"><p>🎭 ${escapeHtml(response.message)}</p></div>`;
    } else {
      // Always render as clean markdown — exactly like ChatGPT
      const html = typeof marked !== 'undefined'
        ? marked.parse(text)
        : escapeHtml(text);
      innerContent = `<div class="ai-bubble">${html}</div>`;
    }

    const time = formatTime();
    const copyText = rawContent || response.message || '';

    return `
    <div class="message-ai" role="listitem">
      <div class="ai-avatar" aria-hidden="true"><i class="bx bx-diamond"></i></div>
      <div class="ai-content">
        ${innerContent}
        <div class="message-actions" role="toolbar" aria-label="Message actions">
          <button class="action-btn copy-btn" data-text="${escapeHtml(copyText)}" aria-label="Copy response">
            <i class="bx bx-copy" aria-hidden="true"></i> Copy
          </button>
          <span class="timestamp" aria-label="Sent at ${time}">${time}</span>
        </div>
      </div>
    </div>`;
  }

  /**
   * Shows the toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {number} duration - ms before auto-dismiss
   */
  function showToast(message, type = 'info', duration = 3500) {
    const icons = {
      success: 'bx-check-circle',
      error: 'bx-error-circle',
      warning: 'bx-error',
      info: 'bx-info-circle',
    };

    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <i class="bx ${icons[type] || 'bx-info-circle'}" aria-hidden="true"></i>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    // Auto-dismiss
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return {
    renderUserMessage,
    renderAIMessage,
    renderOutfitCard,
    showToast,
  };
})();

window.Renderer = Renderer;
