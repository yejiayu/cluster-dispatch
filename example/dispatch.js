'use strict';

const Master = require('../').Master;
const debug = require('debug')('cluster:dispatch');

const master = new Master({
  baseDir: __dirname,
  appName: 'cluster-example',
});

master.ready(() => debug('ready'));
master.on('message', message => debug(message));
master.on('error', error => debug(error.stack));
