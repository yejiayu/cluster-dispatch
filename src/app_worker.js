'use strict';

const cluster = require('cluster');
const assert = require('assert');
const path = require('path');
const SDKBase = require('sdk-base');

const ROLE = require('./constant/role');
const util = require('./util');

class AppWorker extends SDKBase {
  constructor({
    appWorkerCount,
    appPath,
    logging,
    sockPath,
    needAgent,
  } = {}) {
    super();
    this.appPath = appPath;
    this.workerFile = path.join(__dirname, './client/fork_app.js');
    this.workerCount = appWorkerCount;
    this.logging = logging;
    this.sockPath = sockPath;
    this.needAgent = needAgent;

    // 统计所有的worker是否都已经ready
    this._readyCount = 0;

    assert(util.exists(this.workerFile), `app worker 目录 ${this.workerFile} 不存在或不是一个文件`);

    this.workerMap = new Map();
  }

  init() {
    const { workerFile, appPath, workerCount, logging, sockPath, needAgent } = this;
    if (!cluster.isMaster) {
      return;
    }

    cluster.settings = { exec: workerFile };
    Array.from({ length: workerCount }).forEach(() => {
      cluster.fork({
        ROLE: ROLE.APP,
        SOCK_PATH: sockPath,
        NEED_AGENT: needAgent,
        APP_PATH: appPath,
      });
    });

    cluster.on('fork', worker => {
      this.workerMap.set(worker.process.pid, worker);

      worker.on('message', message => this._onReady(message));

      logging('app worker fork pid=%s', worker.process.pid);
    });

    cluster.on('disconnect', worker => {
      logging('app worker disconnect pid=%s', worker.process.pid);
    });

    cluster.on('error', error => logging(error.stack));

    cluster.on('exit', (worker, code, signal) => {
      this.workerMap.delete(worker.process.pid);
      worker.removeAllListeners();
      this._readyCount -= 1;

      logging('app worker exit pid=%s code=%s signal=%s', worker.process.pid, code, signal);
    });
  }

  _onReady(message) {
    if (message && message.ready) {
      this._readyCount += 1;

      if (this._readyCount === this.workerCount) {
        this.ready(true);
      }
    }
  }
}

module.exports = AppWorker;
