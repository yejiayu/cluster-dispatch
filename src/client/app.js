'use strict';

const Base = require('sdk-base');

const Agent = require('../agent');

const ENV_ROLE = process.env.ROLE;
const name = `${ENV_ROLE}@${process.pid}`;

class App extends Base {
  constructor({ logging } = {}) {
    super();
    this.logging = logging;
    this.agent = null;
  }

  * init() {
    const { logging } = this;
    const { NEED_LIBRARY } = process.env;

    if (NEED_LIBRARY === 'true') {
      const agent = new Agent({ logging, name });

      yield agent.init();
      this.agent = agent;
    }

    this.ready(true);
  }
}

module.exports = App;
