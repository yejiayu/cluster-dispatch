'use strict';

const cluster = require('cluster');
const assert = require('assert');

const SDKBase = require('sdk-base');

const ROLE = require('./constant/role');
const util = require('./util');

const INIT = Symbol('init');

class AppWorker extends SDKBase {
  constructor({ baseDir, appWorkerCount, logging }) {
    super();
    this.workerFile = `${baseDir}/index.js`;
    this.workerCount = appWorkerCount;
    this.logging = logging;

    assert(util.exists(this.workerFile), `app worker 目录 ${this.workerFile} 不存在或不是一个文件`);

    this.workerMap = new Map();

    this[INIT]();
    this.ready(true);
  }

  [INIT]() {
    const { workerFile, workerCount, logging } = this;
    if (!cluster.isMaster) {
      return;
    }

    cluster.settings = { exec: workerFile };
    Array.from({ length: workerCount }).forEach(() => {
      cluster.fork({ ROLE: ROLE.APP });
    });

    cluster.on('fork', worker => {
      worker.on('message', data => this.emit('message', data));
      this.workerMap.set(worker.process.pid, worker);

      logging('app worker fork pid=%s', worker.process.pid);
    });

    cluster.on('disconnect', worker => {
      logging('app worker disconnect pid=%s', worker.process.pid);
    });

    cluster.on('error', error => logging(error.stack));

    cluster.on('exit', (worker, code, signal) => {
      this.appWorkerMap.delete(worker.process.pid);
      worker.removeAllListeners();

      logging('app worker exit pid=%s code=%s signal=%s', worker.process.pid, code, signal);
    });
  }

  sendAll({ form, data }) {
    const keys = Array.from(this.workerMap.keys());

    for (const key of keys) {
      // TODO: 需要判空或者worker正在退出就不发送message
      const worker = this.workerMap.get(key);
      worker.send({ form, data });
    }
  }

  sendPid(message) {
    const { logging } = this;
    const { to: pid, data, form } = message;

    const worker = this.workerMap.get(pid);
    if (worker) {
      worker.send({ form, data });
    } else {
      logging(`pid${pid}不存在 data=${data}`);
    }
  }
}

module.exports = AppWorker;
