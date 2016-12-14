'use strict';

const cp = require('child_process');
const assert = require('assert');

const SDKBase = require('sdk-base');
const { merger } = require('lodash');

const ROLE = require('./constant/role');
const util = require('./util');

class LibraryWorker extends SDKBase {
  constructor({ baseDir, logging, sockPath }) {
    super();
    this.workerFile = `${baseDir}/library/index.js`;
    this.logging = logging;
    this.sockPath = sockPath;

    assert(util.exists(this.workerFile), `library worker 目录 ${this.workerFile} 不存在或不是一个文件`);

    this.worker = null;
  }

  init() {
    this.fork();
  }

  fork() {
    const { workerFile, logging, sockPath } = this;

    const env = merger(process.env, {
      ROLE: ROLE.LIBRARY,
      SOCK_PATH: sockPath,
    });
    const worker = cp.fork(workerFile, { env });

    worker.on('message', message => {
      if (message && message.ready) {
        this.ready(true);
      }
    });

    logging(`library worker fork pid=${worker.pid}`);

    worker.on('error', error => logging(error.stack));
    worker.once('exit', (code, signal) => {
      logging(`library worker exit code=${code} signal=${signal}`);

      worker.removeAllListeners();
      if (process.env.NODE_ENV === 'production') {
        this.fork();
      }
    });

    this.worker = worker;
  }
}

module.exports = LibraryWorker;
