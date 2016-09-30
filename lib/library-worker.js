'use strict';

const SDKBase = require('sdk-base');
const cp = require('child_process');

const util = require('./util');
const logger = require('./logger')('library-worker');

class LibraryWorker extends SDKBase {
  constructor(options) {
    super();
    this.libraryWorkerFile = `${options.libraryDir}/index.js`;

    const exists = util.exists(this.libraryWorkerFile);

    if (!exists) {
      throw new Error(`library worker 目录 ${this.libraryWorkerFile} 不存在或不是一个文件`);
    }

    this.libraryWorker = null;
    this.start();

    this.on('message', this.onMessageHandler.bind(this));

    this.ready(true);
  }

  start() {
    this.libraryWorker = cp.fork(this.libraryWorkerFile);

    this.libraryWorker.on('message', data => {
      this.emit('message', data);
    });

    this.libraryWorker.on('error', logger.error);
    this.libraryWorker.once('exit', (code, signal) => {
      logger.error('library worker exit code=%s signal=%s', code, signal);

      this.libraryWorker.removeAllListeners();
      this.libraryWorker = null;

      this.start();
    });
  }

  onMessageHandler(data) {
    this.libraryWorker.send(data);
  }
}

module.exports = LibraryWorker;
