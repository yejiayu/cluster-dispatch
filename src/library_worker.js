'use strict';

const cp = require('child_process');
const assert = require('assert');

const SDKBase = require('sdk-base');

const ROLE = require('./constant/role');
const util = require('./util');

const INIT = Symbol('init');

class LibraryWorker extends SDKBase {
  constructor({ baseDir, logging }) {
    super();
    this.workerFile = `${baseDir}/library/index.js`;
    this.logging = logging;

    assert(util.exists(this.workerFile), `library worker 目录 ${this.workerFile} 不存在或不是一个文件`);

    this.worker = null;

    this[INIT]();
    this.ready(true);
  }

  [INIT]() {
    const { workerFile, logging } = this;
    this.worker = cp.fork(workerFile, {
      env: { ROLE: ROLE.LIBRARY },
    });

    logging(`library worker fork pid=${this.worker.pid}`);

    this.worker.on('message', message => this.emit('message', message));

    this.worker.on('error', error => logging(error.stack));
    this.worker.once('exit', (code, signal) => {
      logging(`library worker exit code=${code} signal=${signal}`);

      this.worker.removeAllListeners();
      this.worker = null;
      if (process.env.NODE_ENV === 'production') {
        this[INIT]();
      }
    });
  }

  send(message) {
    const { to, form, data } = message;

    if (to === ROLE.LIBRARY) {
      this.worker.send({ form, data });
    }
  }
}

module.exports = LibraryWorker;
