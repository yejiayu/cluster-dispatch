'use strict';

const SDKBase = require('sdk-base');
const cfork = require('cfork');
const cluster = require('cluster');
const os = require('os');

const util = require('./util');
const logger = require('./logger')('app-worker');

class AppWorker extends SDKBase {
  constructor(options) {
    super();
    this.appWorkerFile = `${options.appDir}/index.js`;

    const exists = util.exists(this.appWorkerFile);

    if (!exists) {
      throw new Error(`app worker 目录 ${this.appWorkerFile} 不存在或不是一个文件`);
    }

    this.workerCount = options.workerCount || os.cpus().length;

    this.appWorkerMap = new Map();
    this.start();

    this.on('send', this.sendHandler.bind(this));
    this.ready(true);
  }

  start() {
    cfork({
      exec: this.appWorkerFile,
      silent: false,
      count: this.workerCount,
      refork: process.env.NODE_ENV === 'production',
    });

    cluster.on('fork', worker => {
      this.appWorkerMap.set(worker.process.pid, worker);

      worker.on('message', data => this.emit('message', data));
      logger.info('app worker fork pid=%s', worker.process.pid);
    });
    cluster.on('disconnect', worker => {
      logger.info('app worker disconnect pid=%s', worker.process.pid);
    });
    cluster.on('exit', (worker, code, signal) => {
      this.appWorkerMap.delete(worker.process.pid);
      worker.removeAllListeners();
      logger.info('app worker exit pid=%s code=%s signal=%s', worker.process.pid, code, signal);
    });
  }

  sendHandler(data) {
    const keys = Array.from(this.appWorkerMap.keys());

    for (const key of keys) {
      const worker = this.appWorkerMap.get(key);
      worker.send(data);
    }
  }
}

module.exports = AppWorker;
