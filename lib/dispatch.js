'use strict';

const SDKBase = require('sdk-base');

const AppWorker = require('./app-worker');
const LibraryWorker = require('./library-worker');
const logger = require('./logger')('dispatch');

class Dispatch extends SDKBase {
  constructor(options) {
    super();
    options = options || {};
    this.baseDir = options.baseDir || process.cwd();
    this.libraryDir = `${this.baseDir}/library`;
    this.appDir = this.baseDir;

    this.init();
  }

  init() {
    this.appWorker = new AppWorker({
      appDir: this.appDir,
    });
    this.appWorker.on('message', this.messageHandler.bind(this));

    this.appWorker.ready(() => {
      logger.info('app worker ready');
      this.libraryWorker = new LibraryWorker({
        libraryDir: this.libraryDir,
      });
      this.libraryWorker.on('message', this.messageHandler.bind(this));

      this.libraryWorker.ready(() => {
        logger.info('library worker ready');
        this.ready(true);
      });
    });
  }

  messageHandler(data) {
    if (!data.name) {
      throw new Error('illegal message');
    }

    if (data.name === 'app-message') {
      this.emit('app-message', data);
    } else {
      this.emit(data.name, data);
    }
  }

  sendToApp(data) {
    data.name = 'app-message';
    this.appWorker.emit('message', data);
  }

  sendToLibrary(data) {
    this.LibraryWorker.emit('message', data);
  }
}

module.exports = Dispatch;
