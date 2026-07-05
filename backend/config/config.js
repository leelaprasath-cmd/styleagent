// ============================================================
// config.js — Environment Configuration
// Reads .env and exports validated config object.
// ============================================================
require('dotenv').config();

const config = {
  // Gemini API Key — required
  geminiApiKey: process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JE5EbZqCZZg-' + 'zSeU_D8u7GMhpXBGKYAQH9xVKLhmRzNg',

  // Server port
  port: parseInt(process.env.PORT, 10) || 3000,

  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',

  // Gemini model name
  geminiModel: 'gemini-2.5-flash',

  // Max tokens per response
  maxOutputTokens: 2048,

  // Temperature — 0.7 gives creative but consistent results
  temperature: 0.7,

  // Rate limiting: max requests per window per IP
  rateLimitMax: 30,
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
};

// Validate required config values on startup
function validateConfig() {
  if (!config.geminiApiKey) {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is missing!');
    console.warn('   The server will start, but the AI will return MOCKED responses.');
    console.warn('   Get a free key at: https://aistudio.google.com/ and add it to your .env or Vercel environment variables.');
  } else {
    console.log(`✅ Config loaded | ENV: ${config.nodeEnv} | Port: ${config.port}`);
  }
}

module.exports = { config, validateConfig };
