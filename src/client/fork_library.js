'use strict';

const LibraryClient = require('./library');
const { log } = require('../util');

const libPath = process.env.LIBRARY_PATH;
const lib = require(libPath);

(async function forkLibrary() {
  const libraryClient = new LibraryClient({ logging: log, lib });
  await libraryClient.init();

  libraryClient.on('error', log);
}()).catch(log);
