const winston = require('winston');
const path = require('path');

// Create logs directory
const logDir = path.join(__dirname, '../../logs');

// Ensure log directory exists
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message} `;
  const metaMsg = Object.keys(metadata).length 
    ? JSON.stringify(metadata) 
    : '';
  return msg + metaMsg;
});

// Create logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    }),

    // Error log file
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),

    // Combined log file
    new transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

module.exports = logger;