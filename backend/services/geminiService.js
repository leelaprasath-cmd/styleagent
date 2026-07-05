// ============================================================
// geminiService.js — Google Gemini API Wrapper
// Handles all communication with the Gemini LLM API.
// ============================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/config');
const logger = require('../utils/logger');

// Initialize the Gemini SDK ONLY if the API key is present
const genAI = config.geminiApiKey ? new GoogleGenerativeAI(config.geminiApiKey) : null;

/**
 * Mocks a response for demo purposes when the API key is missing.
 */
function getMockResponse(lastUserMessage) {
  const isInterview = lastUserMessage.toLowerCase().includes('interview');
  const isWedding = lastUserMessage.toLowerCase().includes('wedding');

  if (isInterview) {
    return `**I am currently in Demo Mode** because the \`GEMINI_API_KEY\` is not set. However, here is a mock recommendation for your interview:

**Tech Interview Smart Casual**
- **Top:** Crisp Light Blue Oxford Shirt
- **Bottom:** Olive Chinos
- **Outerwear:** Unstructured Navy Blazer
- **Shoes:** Brown Leather Loafers

*Why it works:* The unstructured blazer elevates the look to professional, while the chinos and open collar keep it approachable for tech culture. Make sure the blazer fits well in the shoulders—it's the most important part of the fit.`;
  } else if (isWedding) {
    return `**I am currently in Demo Mode** because the \`GEMINI_API_KEY\` is not set. However, here is a mock recommendation for your wedding:

**Summer Beach Wedding**
- **Top:** White Linen Button-Down (No Tie)
- **Bottom:** Light Tan Linen Trousers
- **Outerwear:** Beige Linen Suit Jacket
- **Shoes:** Suede Loafers (Sockless)

*Why it works:* Linen is highly breathable and perfectly matches the relaxed yet elegant vibe of a beach setting. Embrace the wrinkles—linen naturally creases and adds character to the outfit.`;
  }

  return `**I am currently in Demo Mode** because the \`GEMINI_API_KEY\` is not set on Vercel. However, here is a mock recommendation based on your prompt:

**Casual Everyday Look**
- **Top:** Classic White Cotton Tee
- **Bottom:** Dark Wash Straight-Leg Denim
- **Outerwear:** Lightweight Navy Bomber Jacket
- **Shoes:** Minimalist White Leather Sneakers

*Why it works:* This combination balances casual comfort with clean, modern aesthetics, making it perfect for everyday wear. Tuck the tee slightly at the front (French tuck) for a more tailored silhouette.`;
}

/**
 * Sends a message to Gemini and returns the text response.
 *
 * @param {string} systemPrompt - The system instruction for the model
 * @param {Array<{role: string, content: string}>} messages - Conversation history
 * @param {object} options - Optional overrides (temperature, maxOutputTokens)
 * @returns {Promise<string>} - The model's text response
 */
async function generateContent(systemPrompt, messages, options = {}) {
  const lastMessage = messages[messages.length - 1];

  // If no API key is provided, return a mock response so the UI still works
  if (!genAI) {
    logger.warn('GeminiService', 'API Key missing. Returning mock response.');
    await new Promise((r) => setTimeout(r, 1500)); // Simulate network delay
    return getMockResponse(lastMessage.content);
  }

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
  if (!genAI) {
    // When in Demo Mode, bypass the intentAgent by faking a positive classification
    return '{"isFashion": true, "confidence": 100, "reason": "Demo mode bypass"}';
  }

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
