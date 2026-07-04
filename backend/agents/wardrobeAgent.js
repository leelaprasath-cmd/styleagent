// ============================================================
// wardrobeAgent.js — Analyzes user's available clothing
// ============================================================

const { quickGenerate } = require('../services/geminiService');
const logger = require('../utils/logger');

/**
 * Analyzes clothing items mentioned by the user to categorize them.
 * @param {Array<string>} clothingItems - Items extracted by ContextAgent
 * @returns {Promise<object>} Categorized wardrobe
 */
async function analyzeWardrobe(clothingItems) {
  if (!clothingItems || clothingItems.length === 0) {
    return { tops: [], bottoms: [], shoes: [], outerwear: [], accessories: [] };
  }

  logger.agent('WardrobeAgent', `Analyzing ${clothingItems.length} items`);

  const prompt = `
You are a wardrobe categorization agent. Categorize the following list of clothing items into tops, bottoms, shoes, outerwear, and accessories.

Clothing items:
${JSON.stringify(clothingItems)}

Respond with ONLY a JSON object:
{
  "tops": ["item 1", "item 2"],
  "bottoms": ["item 1"],
  "shoes": [],
  "outerwear": [],
  "accessories": []
}
  `;

  try {
    const response = await quickGenerate(prompt);
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (error) {
    logger.warn('WardrobeAgent', `Parse error: ${error.message}`);
    return { tops: [], bottoms: [], shoes: [], outerwear: [], accessories: [] };
  }
}

module.exports = { analyzeWardrobe };
