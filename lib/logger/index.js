'use strict';

const log4js = require('log4js');

log4js.configure({
  appenders: [
    { type: 'console' },
  ],
});

module.exports = name => {
  const env = process.env.NODE_ENV || 'development';

  const logger = log4js.getLogger(name);
  const level = env === 'development' ? 'debug' : 'info';
  logger.setLevel(level);
  return logger;
};
