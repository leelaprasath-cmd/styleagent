// ============================================================
// api.js — Backend API Communication Layer
// All fetch() calls to the Express backend live here.
// ============================================================

'use strict';

const API = (() => {
  // Base URL — in dev: localhost:3000, in prod: same origin
  const BASE_URL = '';

  /**
   * Sends the conversation to the backend and gets an AI response.
   *
   * @param {Array<{role: string, content: string}>} messages
   * @returns {Promise<object>} - { success, response, meta }
   */
  async function sendMessage(messages) {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    // Handle HTTP error codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Unknown API error');
    }

    return data;
  }

  /**
   * Health check — verify backend is running.
   * @returns {Promise<boolean>}
   */
  async function healthCheck() {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  return { sendMessage, healthCheck };
})();

window.API = API;
