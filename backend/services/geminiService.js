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

  let greeting = "I'm currently in Demo Mode because the `GEMINI_API_KEY` is not set on Vercel. However, I'd still love to recommend an outfit based on your prompt!";
  let whyItWorks = "This combination balances casual comfort with clean, modern aesthetics, making it perfect for everyday wear.";
  
  let outfit = {
    top: "Classic White Cotton Tee",
    bottom: "Dark Wash Straight-Leg Denim",
    shoes: "Minimalist White Leather Sneakers",
    outerwear: "Lightweight Navy Bomber Jacket"
  };
  let colorPalette = [
    { name: "Crisp White", hex: "#FFFFFF", role: "Base" },
    { name: "Navy Blue", hex: "#1E3A8A", role: "Accent" },
    { name: "Slate Grey", hex: "#E5E7EB", role: "Neutral" }
  ];
  let stylingTips = [
    "Tuck the tee slightly at the front (French tuck) for a more tailored silhouette.",
    "Cuff the jeans once or twice to show off the clean sneakers.",
    "Since the API key is missing, this is a simulated response. Add your GEMINI_API_KEY to Vercel to unlock the real AI!"
  ];

  if (isInterview) {
    greeting = "In Demo Mode! But for a tech interview, you want to look polished but not overly formal. Here's a great combination:";
    outfit = {
      top: "Crisp Light Blue Oxford Shirt",
      bottom: "Olive Chinos",
      shoes: "Brown Leather Loafers",
      outerwear: "Unstructured Navy Blazer"
    };
    whyItWorks = "The unstructured blazer elevates the look to professional, while the chinos and open collar keep it approachable for tech culture.";
    stylingTips[0] = "Make sure the blazer fits well in the shoulders—it's the most important part of the fit.";
  } else if (isWedding) {
    greeting = "In Demo Mode! For a beach wedding, breathable fabrics and lighter colors are key to staying cool and looking sharp.";
    outfit = {
      top: "White Linen Button-Down (No Tie)",
      bottom: "Light Tan Linen Trousers",
      shoes: "Suede Loafers (Sockless)",
      outerwear: "Beige Linen Suit Jacket"
    };
    whyItWorks = "Linen is highly breathable and perfectly matches the relaxed yet elegant vibe of a beach setting.";
    stylingTips[0] = "Embrace the wrinkles—linen naturally creases and adds character to the outfit.";
  }

  const jsonResponse = {
    greeting,
    outfit,
    whyItWorks,
    stylingTips,
    colorPalette,
    confidenceScore: 95,
    fashionRating: 4.5,
    stylingNote: "Add your GEMINI_API_KEY to Vercel to unlock real, personalized AI styling!"
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
