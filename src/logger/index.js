'use strict';

const AMSLogger = require('@ali/ams-logger');

module.exports = function createLogger(appName) {
  const amsLogger = AMSLogger.init({
    appName,
  });

  return amsLogger.getLogger('cluster');
};
