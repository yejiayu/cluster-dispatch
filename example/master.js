'use strict';

const co = require('co');
const os = require('os');
const Master = require('../').Master;

const debug = require('debug')('cluster-dispatch:dispatch');

const appWorkerCount = process.env.NODE_ENV === 'production'
    ? os.cpus().length
    : 1;

const master = new Master({
  baseDir: __dirname,
  logging: debug,
  appWorkerCount,
});

co(function* gen() {
  yield master.init();
  master.ready(() => debug('ready'));

  master.on('error', error => debug(error));
}).catch(error => debug(error));
