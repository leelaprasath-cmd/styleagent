// ============================================================
// agentController.js — Orchestrates the Full AI Agent Pipeline
// This is the brain that coordinates all sub-agents.
// ============================================================

const { detectIntent } = require('./intentAgent');
const { extractContext } = require('./contextAgent');
const { generateContent } = require('../services/geminiService');
const { SYSTEM_PROMPT } = require('../prompts/systemPrompt');
const logger = require('../utils/logger');

// The polite off-topic redirect message
const OFF_TOPIC_RESPONSE = {
  type: 'off_topic',
  message:
    "I'm StyleAgent, your AI Personal Fashion Stylist! 👗✨ I specialize in outfit recommendations, wardrobe planning, color coordination, fashion advice, accessories, and dress codes. I'd love to help you look amazing — please ask me something fashion-related!",
};

/**
 * Parses the AI's response to extract structured JSON if present.
 * Falls back to a plain text response if no JSON block found.
 *
 * @param {string} rawResponse - Raw text from Gemini
 * @returns {object} - Parsed response object
 */
function parseAgentResponse(rawResponse) {
  // Try to find a JSON code block in the response
  const jsonMatch = rawResponse.match(/```json\n?([\s\S]*?)\n?```/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return { type: 'structured', data: parsed, raw: rawResponse };
    } catch (e) {
      logger.warn('AgentController', 'JSON parse failed, using plain text');
    }
  }

  // No JSON block — it's a conversational response
  return {
    type: 'conversational',
    message: rawResponse,
  };
}

/**
 * Main pipeline function. Called by the chat route.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<object>} - Final formatted response
 */
async function runPipeline(messages) {
  logger.info('AgentController', `Pipeline started with ${messages.length} messages`);

  // ── Step 1: Intent Detection ────────────────────────────
  const intent = await detectIntent(messages);

  if (!intent.isFashion) {
    logger.info('AgentController', 'Off-topic query detected — blocking');
    return OFF_TOPIC_RESPONSE;
  }

  logger.info('AgentController', 'Fashion intent confirmed — proceeding');

  // ── Step 2: Context Extraction (runs in parallel with main response) ──
  // We run context extraction alongside the main generation for efficiency.
  // Context is used to enrich the response but we don't wait for it.
  const contextPromise = extractContext(messages).catch((err) => {
    logger.warn('AgentController', `Context extraction failed: ${err.message}`);
    return {};
  });

  // ── Step 3: Generate Main AI Response ──────────────────
  logger.info('AgentController', 'Calling Gemini for main response...');
  const rawResponse = await generateContent(SYSTEM_PROMPT, messages);

  // ── Step 4: Parse Response ─────────────────────────────
  const parsedResponse = parseAgentResponse(rawResponse);

  // ── Step 5: Attach Context ─────────────────────────────
  const context = await contextPromise;
  parsedResponse.context = context;

  logger.success('AgentController', `Pipeline complete — type: ${parsedResponse.type}`);

  return parsedResponse;
}

module.exports = { runPipeline };
