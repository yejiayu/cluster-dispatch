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
    this.workerCount = options.workerCount;

    this.init();
  }

  init() {
    this.appWorker = new AppWorker({
      appDir: this.appDir,
      workerCount: this.workerCount,
    });

    this.appWorker.ready(() => {
      this.appWorker.on('message', this.onMessageHandler.bind(this));
      logger.info('app worker ready');
      this.libraryWorker = new LibraryWorker({
        libraryDir: this.libraryDir,
      });

      this.libraryWorker.ready(() => {
        this.libraryWorker.on('message', this.onMessageHandler.bind(this));
        logger.info('library worker ready');
        this.ready(true);
      });
    });
  }

  onMessageHandler(data) {
    if (!data.to) {
      throw new Error('You must specify a target');
    }

    if (data.to === 'app') {
      this.appWorker.emit('send', data);
    } else if (data.to === 'dispatch') {
      this.emit('send', data);
    } else if (data.to === 'library') {
      this.libraryWorker.emit('send', data);
    }
  }

  send(data) {
    if (data.to === 'app') {
      this.appWorker.emit('message', data);
    } else if (data.to === 'library') {
      this.LibraryWorker.emit('message', data);
    }
  }
}

module.exports = Dispatch;
