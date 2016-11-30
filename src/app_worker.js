'use strict';

const cluster = require('cluster');
const assert = require('assert');
const SDKBase = require('sdk-base');

const ROLE = require('./constant/role');
const util = require('./util');

class AppWorker extends SDKBase {
  constructor({ baseDir, appWorkerCount, logging, sockPath, needLibrary }) {
    super();
    this.workerFile = `${baseDir}/index.js`;
    this.workerCount = appWorkerCount;
    this.logging = logging;
    this.sockPath = sockPath;
    this.needLibrary = needLibrary;

    assert(util.exists(this.workerFile), `app worker 目录 ${this.workerFile} 不存在或不是一个文件`);

    this.workerMap = new Map();
  }

  init() {
    const { workerFile, workerCount, logging, sockPath, needLibrary } = this;
    if (!cluster.isMaster) {
      return;
    }

    cluster.settings = { exec: workerFile };
    Array.from({ length: workerCount }).forEach(() => {
      cluster.fork({
        ROLE: ROLE.APP,
        SOCK_PATH: sockPath,
        NEED_LIBRARY: needLibrary,
      });
    });

    cluster.on('fork', worker => {
      this.workerMap.set(worker.process.pid, worker);

      logging('app worker fork pid=%s', worker.process.pid);
    });

    cluster.on('disconnect', worker => {
      logging('app worker disconnect pid=%s', worker.process.pid);
    });

    cluster.on('error', error => logging(error.stack));

    cluster.on('exit', (worker, code, signal) => {
      this.workerMap.delete(worker.process.pid);
      worker.removeAllListeners();

      logging('app worker exit pid=%s code=%s signal=%s', worker.process.pid, code, signal);
    });

    this.ready(true);
  }
}

module.exports = AppWorker;
