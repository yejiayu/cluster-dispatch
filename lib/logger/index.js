'use strict';

var AMSLogger = require('@ali/ams-logger');

module.exports = function createLogger(appName) {
  var amsLogger = AMSLogger.init({
    appName
  });

  return amsLogger.getLogger('cluster');
};