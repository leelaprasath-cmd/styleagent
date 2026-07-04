// ============================================================
// server.js — Express Application Entry Point
// StyleAgent Backend Server
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { config, validateConfig } = require('./config/config');
const logger = require('./utils/logger');

// Validate required environment variables before anything else
validateConfig();

const app = express();

// ── Security Middleware ────────────────────────────────────
// Helmet sets secure HTTP headers automatically
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  })
);

// ── CORS ───────────────────────────────────────────────────
app.use(
  cors({
    origin: config.nodeEnv === 'production' ? process.env.ALLOWED_ORIGIN : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// ── Body Parser ────────────────────────────────────────────
app.use(express.json({ limit: '1mb' })); // Limit body size for security
app.use(express.urlencoded({ extended: false }));

// ── Rate Limiting ──────────────────────────────────────────
// Prevents API abuse — 30 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please wait a moment and try again.',
  },
});
app.use('/api/', limiter);

// ── API Routes ─────────────────────────────────────────────
app.use('/api/chat', require('./routes/chat'));

// ── Serve Frontend Static Files ────────────────────────────
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(
  express.static(frontendPath, {
    // Tell browsers to cache static assets for 1 day
    maxAge: config.nodeEnv === 'production' ? '1d' : '0',
  })
);

// ── Catch-all: Send index.html for any non-API route ───────
// This enables client-side routing (SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('Server', 'Unhandled error', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error.',
  });
});

// ── Start Server ────────────────────────────────────────────
app.listen(config.port, () => {
  console.log('');
  console.log('  ╔════════════════════════════════════════╗');
  console.log('  ║   StyleAgent — AI Fashion Stylist      ║');
  console.log('  ║   Running on http://localhost:' + config.port + '       ║');
  console.log('  ╚════════════════════════════════════════╝');
  console.log('');
  logger.success('Server', `StyleAgent is live at http://localhost:${config.port}`);
});

module.exports = app;
