'use strict';

const LibraryClient = require('../../').LibraryClient;

const libPath = process.env.LIBRARY_PATH;
const lib = require(libPath);

(async function forkLibrary() {
  const libraryClient = new LibraryClient({ logging: console.log, lib });
  await libraryClient.init();

  libraryClient.on('error', error => console.error(error.stack));
}()).catch(error => console.error(error.stack));
