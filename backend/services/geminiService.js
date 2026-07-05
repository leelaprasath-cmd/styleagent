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

  let message = "I am currently in Demo Mode because the `GEMINI_API_KEY` is not set on Vercel. However, I'd still love to recommend an outfit based on your prompt!";
  let title = "Casual Everyday Look";
  let items = [
    { name: "Classic White Tee", description: "A comfortable, well-fitted cotton t-shirt.", icon: "bx-purchase-tag" },
    { name: "Dark Wash Denim", description: "Versatile jeans that can be dressed up or down.", icon: "bx-trip" },
    { name: "White Sneakers", description: "Clean, minimalist sneakers for a sharp finish.", icon: "bx-run" }
  ];
  let colors = ["#FFFFFF", "#1E3A8A", "#E5E7EB"];

  if (isInterview) {
    title = "Tech Interview Smart Casual";
    message = "In Demo Mode! But for a tech interview, you want to look polished but not overly formal. Here's a great combination:";
    items = [
      { name: "Navy Blazer", description: "Unstructured blazer for a professional yet relaxed vibe.", icon: "bx-briefcase" },
      { name: "Crisp Oxford Shirt", description: "Light blue or white button-down shirt.", icon: "bx-user" },
      { name: "Chinos", description: "Olive or khaki chinos to complement the navy blazer.", icon: "bx-street-view" }
    ];
    colors = ["#1E3A8A", "#F3F4F6", "#4B5320"];
  } else if (isWedding) {
    title = "Summer Beach Wedding";
    message = "In Demo Mode! For a beach wedding, breathable fabrics and lighter colors are key to staying cool and looking sharp.";
    items = [
      { name: "Linen Suit", description: "Light tan or beige linen suit.", icon: "bx-sun" },
      { name: "White Linen Shirt", description: "No tie needed, keep the top button open.", icon: "bx-water" },
      { name: "Loafers", description: "Suede loafers in a medium brown.", icon: "bx-walk" }
    ];
    colors = ["#D2B48C", "#FFFFFF", "#8B4513"];
  }

  const jsonResponse = {
    message,
    outfit: {
      title,
      confidence: 95,
      items,
      colors,
      tips: ["Since the API key is missing, this is a simulated response. Add your GEMINI_API_KEY to Vercel to unlock the real AI!"]
    }
  };

  return "```json\n" + JSON.stringify(jsonResponse, null, 2) + "\n```";
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
    return '{"error": "Demo mode active"}';
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
