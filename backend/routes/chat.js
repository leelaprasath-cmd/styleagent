// ============================================================
// chat.js — POST /api/chat Route
// Handles incoming chat requests, validates, runs pipeline.
// ============================================================

const express = require('express');
const router = express.Router();
const { validateChatRequest, sanitizeString } = require('../utils/validator');
const { runPipeline } = require('../agents/agentController');
const logger = require('../utils/logger');

/**
 * POST /api/chat
 * Body: { messages: [{role: "user"|"assistant", content: string}] }
 * Returns: { success: true, response: object }
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();

  // ── Validate Request ───────────────────────────────────
  const validation = validateChatRequest(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  // ── Sanitize Messages ──────────────────────────────────
  const messages = req.body.messages.map((msg) => ({
    role: msg.role,
    content: sanitizeString(msg.content),
  }));

  logger.info('ChatRoute', `New request — ${messages.length} messages`);

  try {
    // ── Run the AI Agent Pipeline ──────────────────────
    const agentResponse = await runPipeline(messages);

    const duration = Date.now() - startTime;
    logger.success('ChatRoute', `Response sent in ${duration}ms`);

    return res.json({
      success: true,
      response: agentResponse,
      meta: {
        processingTime: duration,
        messageCount: messages.length,
      },
    });
  } catch (error) {
    logger.error('ChatRoute', 'Pipeline error', error.message);

    // Return a graceful error to the frontend
    return res.status(500).json({
      success: false,
      error: 'StyleAgent encountered an issue. Please try again in a moment.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/chat/health — Quick health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'StyleAgent API', timestamp: new Date().toISOString() });
});

module.exports = router;
