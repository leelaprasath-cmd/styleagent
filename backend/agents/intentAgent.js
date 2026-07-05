// ============================================================
// intentAgent.js — Determines if user message is fashion-related
// This is the FIRST gatekeeper in the pipeline.
// ============================================================

const { quickGenerate } = require('../services/geminiService');
const { INTENT_TEMPLATE } = require('../prompts/templates');
const logger = require('../utils/logger');

/**
 * Checks if the user's latest message is fashion-related.
 * Returns early to block off-topic queries before hitting the main model.
 *
 * @param {Array} messages - Full conversation history
 * @returns {Promise<{isFashion: boolean, confidence: number}>}
 */
async function detectIntent(messages) {
  // Get the last user message
  const lastUserMessage = messages
    .filter((m) => m.role === 'user')
    .pop()?.content || '';

  logger.agent('IntentAgent', `Analyzing: "${lastUserMessage.substring(0, 80)}..."`);

  try {
    // TEMPORARILY DISABLED: Allow all conversational testing
    return {
      isFashion: true,
      confidence: 100,
      reason: 'Gatekeeper disabled for general conversation'
    };
  } catch (error) {
    // If intent detection fails, assume it's fashion-related (fail open)
    logger.warn('IntentAgent', `Parse error, defaulting to fashion=true: ${error.message}`);
    return { isFashion: true, confidence: 50, reason: 'parse_error' };
  }
}

module.exports = { detectIntent };
