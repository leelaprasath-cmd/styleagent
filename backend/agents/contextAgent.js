// ============================================================
// contextAgent.js — Extracts styling context from conversation
// ============================================================

const { quickGenerate } = require('../services/geminiService');
const { CONTEXT_TEMPLATE } = require('../prompts/templates');
const logger = require('../utils/logger');

/**
 * Extracts structured context from the conversation history.
 * This context is passed to downstream agents.
 *
 * @param {Array} messages - Full conversation history
 * @returns {Promise<object>} - Structured context object
 */
async function extractContext(messages) {
  logger.agent('ContextAgent', 'Extracting context from conversation');

  // Build a readable conversation string for the prompt
  const conversation = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  try {
    const prompt = CONTEXT_TEMPLATE(conversation);
    const response = await quickGenerate(prompt);

    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const context = JSON.parse(cleanResponse);

    logger.agent('ContextAgent', `Extracted: occasion="${context.occasion}", weather="${context.weather}"`);

    return context;
  } catch (error) {
    logger.warn('ContextAgent', `Parse error, returning empty context: ${error.message}`);
    // Return a default empty context — pipeline will still work
    return {
      occasion: null,
      weather: null,
      season: null,
      budget: null,
      stylePreference: null,
      clothingItems: [],
      gender: 'unspecified',
      bodyType: null,
      colorPreferences: [],
      goals: null,
      dressCode: null,
    };
  }
}

module.exports = { extractContext };
