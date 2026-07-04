// ============================================================
// utils.js — Shared Utility Functions
// Loaded first, available to all modules
// ============================================================

'use strict';

/**
 * Shorthand for document.querySelector
 * @param {string} selector - CSS selector
 * @returns {Element|null}
 */
const $ = (selector) => document.querySelector(selector);

/**
 * Shorthand for document.querySelectorAll
 * @param {string} selector - CSS selector
 * @returns {NodeList}
 */
const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Creates a DOM element with optional attributes and children.
 * @param {string} tag - HTML tag name
 * @param {object} attrs - Attributes to set
 * @param {string|Element[]} children - Children
 * @returns {Element}
 */
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key === 'class') el.className = val;
    else if (key === 'html') el.innerHTML = val;
    else el.setAttribute(key, val);
  });
  if (typeof children === 'string') {
    el.textContent = children;
  } else {
    children.forEach((c) => c && el.appendChild(c));
  }
  return el;
}

/**
 * Debounce — delays function execution until after wait ms.
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Formats a Date as a short time string — "2:34 PM"
 * @returns {string}
 */
function formatTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Escapes HTML to prevent XSS in plain text contexts.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Copies text to clipboard and shows feedback.
 * @param {string} text
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

/**
 * Clamps a value between min and max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// Export as global utilities
window.StyleAgentUtils = {
  $,
  $$,
  createElement,
  debounce,
  formatTime,
  escapeHtml,
  copyToClipboard,
  clamp,
};
