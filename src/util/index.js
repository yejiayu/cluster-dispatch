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

  log(name) {
    return msg => {
      if (msg instanceof Error) {
        console.trace(`${name} ${msg}`);
      } else {
        console.log(`${name} ${msg}`);
      }
    };
  },
};

module.exports = util;
