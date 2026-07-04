// ============================================================
// validator.js — Input Validation & Sanitization
// ============================================================

/**
 * Validates the incoming chat request body.
 * @param {object} body - req.body from Express
 * @returns {{ valid: boolean, error?: string }}
 */
function validateChatRequest(body) {
  if (!body) {
    return { valid: false, error: 'Request body is missing.' };
  }

  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: '"messages" must be an array.' };
  }

  if (messages.length === 0) {
    return { valid: false, error: '"messages" array cannot be empty.' };
  }

  if (messages.length > 50) {
    return { valid: false, error: 'Too many messages in context (max 50).' };
  }

  for (const msg of messages) {
    if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
      return { valid: false, error: 'Each message must have role "user" or "assistant".' };
    }
    if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
      return { valid: false, error: 'Each message must have non-empty string content.' };
    }
    if (msg.content.length > 4000) {
      return { valid: false, error: 'Message content too long (max 4000 chars).' };
    }
  }

  return { valid: true };
}

/**
 * Sanitizes a string to prevent XSS — strips HTML tags.
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

module.exports = { validateChatRequest, sanitizeString };
