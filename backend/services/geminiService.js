// ============================================================
// geminiService.js — Google Gemini API Wrapper
// Handles all communication with the Gemini LLM API.
// ============================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/config');
const logger = require('../utils/logger');

// Initialize the Gemini SDK with our API key
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * Sends a message to Gemini and returns the text response.
 *
 * @param {string} systemPrompt - The system instruction for the model
 * @param {Array<{role: string, content: string}>} messages - Conversation history
 * @param {object} options - Optional overrides (temperature, maxOutputTokens)
 * @returns {Promise<string>} - The model's text response
 */
async function generateContent(systemPrompt, messages, options = {}) {
  const model = genAI.getGenerativeModel({
    model: config.geminiModel,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: options.temperature ?? config.temperature,
      maxOutputTokens: options.maxOutputTokens ?? config.maxOutputTokens,
      topP: 0.95,
      topK: 40,
    },
  });

  // Convert our message format to Gemini's format
  // Gemini uses 'user' and 'model' (not 'assistant')
  const history = messages.slice(0, -1).map((msg) => {
    let cleanText = msg.content;
    if (msg.role === 'assistant') {
      try {
        const jsonMatch = cleanText.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          cleanText = parsed.message || "Provided an outfit recommendation.";
        }
      } catch (e) {
        // Fallback if parsing fails
      }
    }
    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: cleanText || "Hello" }],
    };
  });

  // The last message is the current user input
  const lastMessage = messages[messages.length - 1];

  logger.agent('GeminiService', `Sending request with ${history.length} history items`);

  try {
    // Start a chat session with history
    const chat = model.startChat({ history });

    // Send the latest user message
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response.text();

    logger.agent('GeminiService', `Received response (${response.length} chars)`);
    return response;
  } catch (error) {
    // Handle specific Gemini API errors
    if (error.status === 429) {
      logger.warn('GeminiService', 'Rate limit hit — retrying in 2s...');
      await new Promise((r) => setTimeout(r, 2000));
      return generateContent(systemPrompt, messages, options);
    }

    if (error.status === 400) {
      logger.error('GeminiService', 'Bad request to Gemini API', error.message);
      throw new Error('Invalid request to AI service. Please rephrase your question.');
    }

    logger.error('GeminiService', 'Gemini API error', error.message);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
}

/**
 * Simple one-shot call for sub-agent tasks (no history needed).
 * Used internally by agents that need quick classifications.
 *
 * @param {string} prompt - Full prompt including instructions + input
 * @returns {Promise<string>}
 */
async function quickGenerate(prompt) {
  const model = genAI.getGenerativeModel({
    model: config.geminiModel,
    generationConfig: {
      temperature: 0.3, // Lower temp for classification tasks
      maxOutputTokens: 512,
    },
  });

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    logger.error('GeminiService', 'quickGenerate error', error.message);
    throw new Error('AI service error. Please try again.');
  }
}

module.exports = { generateContent, quickGenerate };
