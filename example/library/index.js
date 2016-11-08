'use strict';

const co = require('co');
const debug = require('debug')('cluster:library');

const Messager = require('../../').Messager;

const messager = new Messager();

messager.on('message', debug);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

debug('fork library');

co(function* gen() {
  while (true) {
    yield sleep(3000 * 10);
    debug('library sleep end');
  }
}).catch(debug);
