'use strict';

const assert = require('assert');
const os = require('os');
const path = require('path');

const Messenger = require('socket-messenger').Messenger;
const SDKBase = require('sdk-base');

const AppWorker = require('./app_worker');
const LibraryWorker = require('./library_worker');
const logger = require('./logger');

class Master extends SDKBase {
  constructor({
    appName,
    baseDir = process.cwd(),
    appWorkerCount = os.cpus().length,
    logging = logger(appName || 'cluster').debug,
  }) {
    super();
    assert(appName, 'options.appName required');

    this.appName = appName;
    this.baseDir = baseDir;
    this.appWorkerCount = appWorkerCount;
    this.logging = logging;

    this.sockPath = path.join(os.tmpdir(), 'midway.sock');
    this.appCluster = null;
    this.library = null;
    this.messenger = new Messenger({ sockPath: this.sockPath });
  }

  * init() {
    const { baseDir, appWorkerCount, logging, sockPath } = this;

    yield this.messenger.init();
    this.messenger.on('error', error => this.emit('error', error));

    const library = new LibraryWorker({ baseDir, logging, sockPath });
    library.init();
    library.on('error', error => this.emit('error', error));

    library.ready(() => {
      const appCluster = new AppWorker({ baseDir, appWorkerCount, logging, sockPath });
      appCluster.init();
      appCluster.on('error', error => this.emit('error', error));

      this.library = library;
      this.appCluster = appCluster;
    });
  }
}

module.exports = Master;
