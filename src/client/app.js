'use strict';

const Base = require('sdk-base');
const MailBox = require('socket-messenger').MailBox;

const Agent = require('../agent');

const ENV_ROLE = process.env.ROLE;
const name = `${ENV_ROLE}@${process.pid}`;
const SOCK_PATH = process.env.SOCK_PATH;

class App extends Base {
  constructor({ logging } = {}) {
    super();
    this.logging = logging;
    this.mailBox = new MailBox({ name, sockPath: SOCK_PATH });
    this.agent = new Agent({ logging, mailBox: this.mailBox });
  }

  * init() {
    const { mailBox, agent } = this;
    const { NEED_LIBRARY } = process.env;

    yield mailBox.init();

    if (NEED_LIBRARY === 'true') {
      yield agent.init();
      this.agent = agent;
    }

    process.send({ ready: true });
    this.ready(true);
  }
}

module.exports = App;
