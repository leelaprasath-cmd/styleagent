// ============================================================
// logger.js — Simple structured console logger
// ============================================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const timestamp = () => new Date().toISOString();

const logger = {
  info: (msg, data = '') => {
    console.log(`${colors.cyan}[INFO]${colors.reset} ${timestamp()} ${msg}`, data);
  },
  success: (msg, data = '') => {
    console.log(`${colors.green}[OK]${colors.reset}   ${timestamp()} ${msg}`, data);
  },
  warn: (msg, data = '') => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${timestamp()} ${msg}`, data);
  },
  error: (msg, data = '') => {
    console.error(`${colors.red}[ERR]${colors.reset}  ${timestamp()} ${msg}`, data);
  },
  agent: (agentName, msg) => {
    console.log(`${colors.gray}[AGENT:${agentName}]${colors.reset} ${msg}`);
  },
};

module.exports = logger;
