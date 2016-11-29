'use strict';

const AMSLogger = require('@ali/ams-logger');

const amsLogger = AMSLogger.init({
  appName: 'cluster',
});

module.exports = category => amsLogger.getLogger(category);
