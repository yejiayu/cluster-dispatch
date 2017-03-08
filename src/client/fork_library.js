'use strict';

const LibraryClient = require('./library');
const log = require('../util').log('cluster:library_worker');

const libPath = process.env.LIBRARY_PATH;
const lib = require(libPath);

(async function forkLibrary() {
  const libraryClient = new LibraryClient({ logger: log, lib });
  await libraryClient.init();

  libraryClient.on('error', log.error);
}()).catch(log.error);
