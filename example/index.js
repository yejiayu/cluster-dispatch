'use strict';

const debug = require('debug')('cluster-dispatch:app');
const co = require('co');

const AppClient = require('../').AppClient;

co(function* gen() {
  const appClient = new AppClient({ logging: debug });
  yield appClient.init();
  appClient.on('error', debug);

  require('./web');
}).catch(debug);
