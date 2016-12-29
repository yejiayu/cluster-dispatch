'use strict';

const mm = require('mm');
const MailBox = require('socket-messenger').MailBox;
const debug = require('debug')('cluster-dispatch:test:client:app');

const Agent = require('../../').Agent;
const AppClient = require('../../').AppClient;

describe('test/client/app.test.js', () => {
  beforeEach(() => {
    mm(MailBox, 'constructor', () => {});
    mm(Agent, 'constructor', () => {});
  });

  it('need library app ready', function* onReady() {
    process.env.NEED_LIBRARY = 'true';

    const appClient = new AppClient({ logging: debug });
    mm(appClient.mailBox, 'init', () => new Promise((resolve) => resolve()));
    mm(appClient.agent, 'init', () => new Promise((resolve) => resolve()));

    yield appClient.init();
    appClient.on('error', debug);
    yield ready(appClient);
  });

  it('not need library app ready', function* onReady() {
    process.env.NEED_LIBRARY = 'false';

    const appClient = new AppClient({ logging: debug });
    mm(appClient.mailBox, 'init', () => new Promise((resolve) => resolve()));

    yield appClient.init();
    appClient.on('error', debug);
    yield ready(appClient);
  });
});

function ready(obj) {
  return new Promise((resolve, reject) => {
    const timeoutFlag = setTimeout(reject, 4000);
    obj.ready(() => {
      clearTimeout(timeoutFlag);
      resolve();
    });
  });
}
