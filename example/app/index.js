'use strict';

const co = require('co');
const debug = require('debug')('cluster:app');

const mailBox = require('./mail-box');

co(function* gen() {
  yield mailBox.init();
  process.send({ ready: true });

  const { message: agents, to } = yield mailBox.write()
      .setTo('LIBRARY')
      .setMessage({ action: 'getAgents' })
      .send();

  debug(agents, to);
}).catch(debug);
