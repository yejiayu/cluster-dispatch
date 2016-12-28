'use strict';

const fs = require('fs');
const debug = require('debug')('cluster:util');

const util = {
  exists(path) {
    try {
      const file = fs.statSync(path);
      if (!file || !file.isFile()) {
        return false;
      }

      return true;
    } catch (error) {
      debug(error);
      return false;
    }
  },

  generateRequestId(prefix, NO) {
    return `${prefix}#${NO}`;
  },

};

module.exports = util;
