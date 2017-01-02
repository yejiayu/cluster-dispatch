'use strict';

const debug = require('debug')('cluster-dispatch:web');
const koa = require('koa');

const agent = require('../agent');

const app = koa();

app.use(function* helloWorld() {
  const userName = yield agent.demoLib.getUserName();
  debug(userName);

  const rpDemo = yield agent.rpDemo.getRpDemo();
  debug(rpDemo);

  this.body = 'hello world';
});

app.listen(8000, () => debug('open http://localhost:8000'));
