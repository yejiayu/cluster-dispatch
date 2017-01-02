'use strict';

const fs = require('fs');

const util = {
  exists(path) {
    try {
      const file = fs.statSync(path);
      if (!file || !file.isFile()) {
        return false;
      }

      return true;
    } catch (error) {
      /* istanbul ignore next */
      return false;
    }
  },

  log(msg) {
    if (msg instanceof Error) {
      console.trace(msg);
    } else {
      console.log(msg);
    }
  },
};

module.exports = util;
