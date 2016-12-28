'use strict';

const debug = require('debug')('cluster-dispatch:web');
const koa = require('koa');

const common = require('../common');

const agent = common.agent;
const app = koa();

app.use(function* helloWorld() {
  const userName = yield agent.demoLib.getUserName();
  debug(userName);
  // const userName = yield agent.demoLib.getUserName();
  // debug(agent.rpDemo);
  const rpDemo = yield agent.rpDemo.getRpDemo();
  // debug(userName);
  debug(rpDemo);

  this.body = rpDemo;
});

app.listen(8000, () => debug('open http://localhost:8000'));
