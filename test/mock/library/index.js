'use strict';

const debug = require('debug')('cluster-dispatch:library');
const co = require('co');
const LibraryClient = require('../../../').LibraryClient;

const lib = require('./lib');

co(function* gen() {
  const libraryClient = new LibraryClient({ logging: debug, lib });
  yield libraryClient.init();

  libraryClient.on('error', debug);
}).catch(debug);
