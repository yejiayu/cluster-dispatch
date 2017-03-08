'use strict';

const Base = require('sdk-base');
const MailBox = require('socket-messenger').MailBox;

const Agent = require('../agent');

const RawAgent = Agent.RawAgent;
const ENV_ROLE = process.env.ROLE;
const name = `${ENV_ROLE}@${process.pid}`;
const SOCK_PATH = process.env.SOCK_PATH;

class App extends Base {
  constructor({ logger } = {}) {
    super();
    this.logger = logger;
    this.mailBox = new MailBox({ name, sockPath: SOCK_PATH });
    this.agent = new RawAgent({ logger, mailBox: this.mailBox });
  }

  async init() {
    const { mailBox, agent } = this;

    await mailBox.init();

    if (process.env.NEED_AGENT === 'true') {
      await agent.init();
      Agent.setAgent(agent);
    }

    process.send({ ready: true });

    this.ready(true);
  }
}

module.exports = App;
