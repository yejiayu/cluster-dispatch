'use strict';

const Base = require('sdk-base');

const Agent = require('../agent');

class App extends Base {
  constructor({ logging } = {}) {
    super();
    this.logging = logging;
    this.agent = null;
  }

  * init() {
    const { logging } = this;
    const { NEED_LIBRARY } = process.env;

    logging(NEED_LIBRARY);
    if (NEED_LIBRARY) {
      const agent = new Agent({ logging });

      yield agent.init();
      this.agent = agent;
    }

    this.ready(true);
  }
}

module.exports = App;
