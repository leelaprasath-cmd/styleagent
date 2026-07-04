// ============================================================
// templates.js — Reusable Prompt Templates
// These templates are used by individual agents to build
// focused sub-prompts for specific classification tasks.
// ============================================================

/**
 * Intent detection prompt — determines if message is fashion-related.
 * Uses few-shot examples for accuracy.
 */
const INTENT_TEMPLATE = (userMessage) => `
You are a fashion topic classifier. Your job is to determine if the user's message is related to fashion, clothing, style, accessories, wardrobe, or appearance.

Respond with ONLY a JSON object in this exact format:
{"isFashion": true/false, "confidence": 0-100, "reason": "brief reason"}

Examples:
- "What should I wear to a job interview?" → {"isFashion": true, "confidence": 99, "reason": "outfit advice request"}
- "What is the capital of France?" → {"isFashion": false, "confidence": 99, "reason": "geography question"}
- "How do I match colors?" → {"isFashion": true, "confidence": 98, "reason": "color coordination in fashion"}
- "Can you help me with math?" → {"isFashion": false, "confidence": 99, "reason": "mathematics question"}
- "What shoes go with jeans?" → {"isFashion": true, "confidence": 99, "reason": "footwear styling question"}
- "Tell me about climate change" → {"isFashion": false, "confidence": 97, "reason": "environmental topic"}

User message: "${userMessage}"

Respond with ONLY the JSON object, no other text.
`;

/**
 * Context extraction prompt — pulls structured info from conversation.
 */
const CONTEXT_TEMPLATE = (conversation) => `
You are a context extraction agent for a fashion stylist AI. 
Analyze this conversation and extract relevant styling context.

Conversation:
${conversation}

Extract and return ONLY a JSON object with these fields (use null for missing info):
{
  "occasion": "string or null",
  "weather": "string or null", 
  "season": "string or null",
  "budget": "string or null",
  "stylePreference": "string or null",
  "clothingItems": ["array of mentioned clothing items"],
  "gender": "male/female/non-binary/unspecified",
  "bodyType": "string or null",
  "colorPreferences": ["array of mentioned colors"],
  "goals": "string or null",
  "dressCode": "string or null"
}

Respond with ONLY the JSON object.
`;

module.exports = { INTENT_TEMPLATE, CONTEXT_TEMPLATE };
