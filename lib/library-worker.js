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

    this.on('message', this.messageHandler.bind(this));

    this.ready(true);
  }

  start() {
    this.agentWorker = cp.fork(this.libraryWorkerFile);

    this.agentWorker.on('message', data => {
      this.emit('message', data);
    });

    this.agentWorker.on('error', logger.error);
    this.agentWorker.once('exit', (code, signal) => {
      logger.error('library worker exit code=%s signal=%s', code, signal);

      this.agentWorker.removeAllListeners();
      this.agentWorker = null;

      this.start();
    });
  }

  messageHandler(data) {
    this.agentWorker.send(data);
  }
}

module.exports = LibraryWorker;
