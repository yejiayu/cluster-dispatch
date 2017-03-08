'use strict';

const log = require('../util').log('cluster:app_worker');
const AppClient = require('./app');

const appPath = process.env.APP_PATH;

(async function forkApp() {
  const appClient = new AppClient({ logger: log });
  await appClient.init();
  appClient.on('error', log.error);

  try {
    require(appPath);
  } catch (e) {
    log.error(e);
  }
}()).catch(log.error);
