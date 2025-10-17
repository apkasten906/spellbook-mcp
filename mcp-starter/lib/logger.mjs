import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import winston from 'winston';
import 'winston-daily-rotate-file';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = process.env.LOG_DIR || path.resolve(__dirname, '..', 'logs');
const LOG_MCP =
  process.env.LOG_MCP === '1' ||
  process.env.LOG_MCP === 'true' ||
  process.env.LOG_MCP === 'yes' ||
  process.env.LOG_MCP === 'on';
const maxSize = process.env.LOG_ROTATE_MAX_BYTES || '1m'; // winston accepts human sizes
const maxFiles = process.env.LOG_ROTATE_BACKUPS || '3';

// Ensure log dir exists
try {
  fs.mkdirSync(LOG_DIR, { recursive: true });
} catch {
  // ignore
}

const transport = new winston.transports.DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'mcp-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize,
  maxFiles,
  level: 'debug',
});

const errorTransport = new winston.transports.DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'mcp-error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize,
  maxFiles,
  level: 'error',
});

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} - ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [transport, errorTransport],
});

// Mirror to console only when verbose logging is explicitly enabled
if (LOG_MCP) {
  logger.add(new winston.transports.Console({ level: 'debug', format: winston.format.simple() }));
}

export const info = (...parts) =>
  logger.info(parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' '));
export const debug = (...parts) =>
  logger.debug(parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' '));
export const warn = (...parts) =>
  logger.warn(parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' '));
export const error = (...parts) =>
  logger.error(parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' '));

export const stream = {
  write: (msg) => {
    // strip trailing newline
    const m = msg && msg.endsWith ? msg.trimEnd() : String(msg);
    logger.info(m);
  },
};

export const getLogDir = () => LOG_DIR;
