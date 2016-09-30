'use strict';

const SDKBase = require('sdk-base');
const cfork = require('cfork');
const os = require('os');
const _ = require('lodash');

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

    this.on('message', this.messageHandler.bind(this));
    this.ready(true);
  }

  start() {
    cfork({
      exec: this.appWorkerFile,
      silent: false,
      count: this.workerCount,
      refork: true, // process.env.NODE_ENV === 'production',
    })
    .on('fork', worker => {
      this.appWorkerMap.set(worker.process.pid, worker);
      logger.info('app worker fork pid=%s', worker.process.pid);
    })
    .on('disconnect', worker => {
      logger.info('app worker disconnect pid=%s', worker.process.pid);
    })
    .on('exit', (worker, code, signal) => {
      this.appWorkerMap.delete(worker.process.pid);
      worker.removeAllListeners();
      logger.info('app worker exit pid=%s code=%s signal=%s', worker.process.pid, code, signal);
    });
  }

  messageHandler(data) {
    const keys = Array.from(this.appWorkerMap.keys());
    const randomIndex = _.random(0, keys.length - 1);

    const worker = this.appWorkerMap.get(keys[randomIndex]);
    worker.send(data);
  }
}

module.exports = AppWorker;
