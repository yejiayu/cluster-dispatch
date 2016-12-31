'use strict';

const debug = require('debug')('cluster-dispatch:test:web');
const koa = require('koa');

const app = koa();

exports.init = () => new Promise((resolve) => { app.listen(9999, resolve); });

exports.start = () => {
  const agent = require('../agent');

  app.use(function* helloWorld() {
    try {
      const userName = yield agent.demoLib.getUserName('yejiayu');
      debug(userName);

      const rpDemo = yield agent.rpDemo.getRpDemo();
      debug(rpDemo);

      this.body = userName;
    } catch (e) {
      debug(e);
    }
  });
};
