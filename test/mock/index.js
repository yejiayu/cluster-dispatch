'use strict';

const debug = require('debug')('cluster-dispatch:test:app');
const co = require('co');

const web = require('./web');
const AppClient = require('../../').AppClient;

module.exports = co(function* gen() {
  const appClient = new AppClient({ logging: debug });
  yield web.init();
  yield appClient.init();
  appClient.on('error', debug);

  web.start();
}).catch(debug);
