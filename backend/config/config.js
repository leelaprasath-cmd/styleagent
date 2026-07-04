// ============================================================
// config.js — Environment Configuration
// Reads .env and exports validated config object.
// ============================================================
require('dotenv').config();

const config = {
  // Gemini API Key — required
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // Server port
  port: parseInt(process.env.PORT, 10) || 3000,

  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',

  // Gemini model name
  geminiModel: 'gemini-2.0-flash',

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
    console.error('❌ GEMINI_API_KEY is missing! Please add it to your .env file.');
    console.error('   Get a free key at: https://aistudio.google.com/');
    process.exit(1);
  }
  console.log(`✅ Config loaded | ENV: ${config.nodeEnv} | Port: ${config.port}`);
}

module.exports = { config, validateConfig };
