'use strict';

const os = require('os');
const path = require('path');

const Messenger = require('socket-messenger').Messenger;
const SDKBase = require('sdk-base');

const AppWorker = require('./app_worker');
const LibraryWorker = require('./library_worker');

class Master extends SDKBase {
  /**
   * Master进程, app和library分别为他的子进程
   *
   * @param {Object} options
   *   - {String} baseDir - 工程根路径
   *   - {String} appPath - app进程入口文件, 可以是一个相对路径
   *   - {String} libraryPath - app进程入口文件, 可以是一个相对路径
   *   - {Number} appWorkerCount - 需要启动的app进程数
   *   - {Funcion} logging - log
   *   - {Boolean} needLibrary - 是否需要启动library进程
   * @constructor
   */
  constructor({
    baseDir = process.cwd(),
    appPath = 'index.js',
    libraryPath = 'library/index.js',
    appWorkerCount = os.cpus().length,
    logging = console.log,
    needLibrary = true,
  } = {}) {
    super();
    this.baseDir = baseDir;
    this.appPath = appPath;
    this.libraryPath = libraryPath;
    this.appWorkerCount = appWorkerCount;
    this.logging = logging;
    this.needLibrary = needLibrary;

    this.sockPath = path.join(os.tmpdir(), 'midway.sock');
    this.appCluster = null;
    this.library = null;
    this.messenger = new Messenger({ sockPath: this.sockPath });
  }

  * init() {
    const { needLibrary } = this;

    yield this.messenger.init();
    this.messenger.on('error', error => this.emit('error', error));

    // 应对不需要启动library进程的情况
    if (needLibrary) {
      const library = this.startLibrary();
      yield ready(library);
    }

    const appCluster = this.startApp();
    this.appCluster = appCluster;
  }

  startApp() {
    const { baseDir, appPath, appWorkerCount, logging, sockPath, needLibrary } = this;

    const appCluster = new AppWorker({
      baseDir,
      appPath,
      appWorkerCount,
      logging,
      sockPath,
      needLibrary,
    });
    appCluster.init();
    appCluster.on('error', error => this.emit('error', error));

    logging('start app');
    return appCluster;
  }

  startLibrary() {
    const { baseDir, libraryPath, logging, sockPath } = this;

    const library = new LibraryWorker({ baseDir, libraryPath, logging, sockPath });
    library.init();
    library.on('error', error => this.emit('error', error));

    return library;
  }
}

module.exports = Master;

function ready(obj) {
  return new Promise((resolve, reject) => {
    const timeoutFlag = setTimeout(reject, 4000);
    obj.ready(() => {
      clearTimeout(timeoutFlag);
      resolve();
    });
  });
}
