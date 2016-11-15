'use strict';

const co = require('co');

const Master = require('../').Master;
const debug = require('debug')('cluster:dispatch');

const master = new Master({
  baseDir: __dirname,
  appName: 'cluster-example',
});

co(function* gen() {
  yield master.init();
  master.ready(() => debug('ready'));

  master.on('error', error => debug(error.stack));
}).catch(error => debug(error.stack));
