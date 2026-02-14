const winston = require('winston');
const chalk = require('chalk');
require('dotenv').config();

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom console format
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  const levelStyled =
    {
      error: chalk.red.bold('ERROR'),
      warn: chalk.yellow.bold('WARN'),
      info: chalk.blue.bold('INFO'),
      http: chalk.magenta.bold('HTTP'),
      debug: chalk.gray.bold('DEBUG'),
    }[level] || level;

  return `${chalk.gray(timestamp)} | ${levelStyled} | ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
  transports: [
    new winston.transports.Console({
      format: combine(consoleFormat),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), winston.format.json()),
    }),
  ],
});

module.exports = logger;
