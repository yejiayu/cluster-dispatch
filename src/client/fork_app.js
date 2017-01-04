'use strict';

const log = require('../util').log('cluster:app_worker');
const AppClient = require('./app');

const appPath = process.env.APP_PATH;


(async function forkApp() {
  const appClient = new AppClient({ logging: log });
  await appClient.init();
  appClient.on('error', log);

  try {
    require(appPath);
  } catch (e) {
    log(e);
  }
}()).catch(log);
