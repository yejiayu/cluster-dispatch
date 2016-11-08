'use strict';

const co = require('co');
const debug = require('debug')('cluster:app');

const Messager = require('../../').Messager;

const messager = new Messager();

function sleep(ms) {
  messager.sendToMaster('send master');
  messager.sendToLibrary('send library');
  return new Promise(resolve => setTimeout(resolve, ms));
}

co(function* gen() {
  while (true) {
    yield sleep(3000 * 10);
    debug('app sleep end');
  }
}).catch(debug);
