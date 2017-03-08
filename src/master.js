'use strict';

const co = require('co');
const os = require('os');
const path = require('path');

const Messenger = require('socket-messenger').Messenger;
const SDKBase = require('sdk-base');

const AppWorker = require('./app_worker');
const LibraryWorker = require('./library_worker');
const util = require('./util');

class Master extends SDKBase {
  /**
   * Master进程, app和library分别为他的子进程
   *
   * @param {Object} options
   *   - {String} baseDir - 工程根路径
   *   - {String} appPath - app进程入口文件, 可以是一个相对路径
   *   - {String} libraryPath - 需要代理的库的入口文件, 可以是一个相对路径
   *   - {Number} appWorkerCount - 需要启动的app进程数
   *   - {Funcion} logging - log, v3版本移除
   *   - {Object} logger - console like
   *   - {Boolean} needLibrary - 是否需要启动library进程
   *   - {Boolean} needAgent - 是否需要自动启动代理
   * @constructor
   */
  constructor({
    baseDir = process.cwd(),
    appPath = 'index.js',
    libraryPath = 'agent/lib/index.js',
    appWorkerCount = os.cpus().length,
    logging,
    logger,
    needLibrary = true,
    needAgent = true,
  } = {}) {
    super();
    if (!needLibrary && needAgent) {
      throw new Error('needLibrary为false时 needAgent不允许设为true');
    }

    this.baseDir = baseDir;
    this.appPath = path.join(baseDir, appPath);
    this.libraryPath = path.join(baseDir, libraryPath);
    this.appWorkerCount = appWorkerCount;
    this.logging = util.log('master:', logging);
    this.logger = logger === undefined ? this.logging : logger;
    this.needLibrary = needLibrary;
    this.needAgent = needLibrary;

    if (process.platform === 'win32') {
      this.sockPath = `\\\\.\\pipe\\pipe-midway-${process.pid}`;
    } else {
      this.sockPath = path.join(os.tmpdir(), 'midway.sock');
    }

    this.appCluster = null;
    this.library = null;
    this.messenger = new Messenger({ sockPath: this.sockPath });
  }

  async init() {
    const { needLibrary, messenger } = this;

    await co.wrap(messenger.init).apply(messenger);
    messenger.on('error', error => this.emit('error', error));

    // 应对不需要启动library进程的情况
    if (needLibrary) {
      this.library = this.startLibrary();
      await ready(this.library);
    }

    this.appCluster = this.startApp();
    await ready(this.appCluster);

    this.ready(true);
  }

  startApp() {
    const appCluster = new AppWorker({
      baseDir: this.baseDir,
      appPath: this.appPath,
      appWorkerCount: this.appWorkerCount,
      logger: this.logger,
      sockPath: this.sockPath,
      needLibrary: this.needLibrary,
      needAgent: this.needAgent,
    });
    appCluster.init();
    appCluster.on('error', error => this.emit('error', error));

    this.logger.info('start app');
    return appCluster;
  }

  startLibrary() {
    const { libraryPath, logger, sockPath } = this;

    const library = new LibraryWorker({ libraryPath, logger, sockPath });
    library.init();
    library.on('error', error => this.emit('error', error));

    return library;
  }
}

module.exports = Master;

function ready(obj) {
  return new Promise((resolve, reject) => {
    const timeoutFlag = setTimeout(() => {
      reject(`${obj.constructor.name} ready fail`);
    }, 10000);
    obj.ready(() => {
      clearTimeout(timeoutFlag);
      resolve();
    });
  });
}
