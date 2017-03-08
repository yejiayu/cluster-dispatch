'use strict';

const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const SDKBase = require('sdk-base');
const { merge } = require('lodash');

const ROLE = require('./constant/role');
const util = require('./util');

class LibraryWorker extends SDKBase {
  constructor({ libraryPath, logger, sockPath } = {}) {
    super();
    this.libraryPath = libraryPath;
    this.logger = logger;
    this.sockPath = sockPath;

    assert(util.exists(this.libraryPath), `libraryPath ${this.libraryPath} 不存在或不是一个文件`);

    this.worker = null;
  }

  init() {
    this.fork();
  }

  fork() {
    const { libraryPath, logger, sockPath } = this;

    const env = merge(process.env, {
      ROLE: ROLE.LIBRARY,
      LIBRARY_PATH: libraryPath,
      SOCK_PATH: sockPath,
    });
    const worker = cp.fork(path.join(__dirname, './client/fork_library.js'), { env });

    worker.on('message', message => {
      if (message && message.ready) {
        this.ready(true);
      }
    });

    logger.info(`library worker fork pid = ${worker.pid}`);

    worker.on('error', logger.error);
    worker.once('exit', (code, signal) => {
      logger.error(`library worker exit code = ${code}, signal = ${signal}`);

      worker.removeAllListeners();
      if (process.env.NODE_ENV === 'production') {
        this.fork();
      }
    });

    this.worker = worker;
  }
}

module.exports = LibraryWorker;
