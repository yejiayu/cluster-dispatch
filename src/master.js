'use strict';

const assert = require('assert');
const os = require('os');

const SDKBase = require('sdk-base');
const is = require('is-type-of');

const ROLE = require('./constant/role');
const AppWorker = require('./app_worker');
const LibraryWorker = require('./library_worker');
const logger = require('./logger');

const $INIT = Symbol('init_master');
const $BIND = Symbol('bind_handler');

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

    this.appCluster = null;
    this.library = null;

    this[$INIT]();
  }

  [$INIT]() {
    const { baseDir, appWorkerCount, logging } = this;

    this.appCluster = new AppWorker({ baseDir, appWorkerCount, logging });
    this.appCluster.ready(() => {
      this.library = new LibraryWorker({ baseDir, logging });
      this.library.ready(() => {
        this[$BIND]();
        this.ready(true);
      });
    });
  }

  [$BIND]() {
    this.appCluster.on('message', message => this.onMessageHandler(message));
    this.library.on('message', message => this.onMessageHandler(message));
  }

  onMessageHandler(message) {
    const { to, form, data } = message;

    if (to === ROLE.MASTER) {
      this.emit('message', { form, data });
    } else if (to === ROLE.APP) {
      this.appCluster.sendAll(message);
    } else if (to === ROLE.LIBRARY) {
      this.library.send(message);
    } else if (is.number(to)) {
      this.appCluster.sendPid(message);
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

module.exports = Master;
