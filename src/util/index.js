'use strict';

const fs = require('fs');
const { isFunction } = require('lodash');

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

  log(name, logging) {
    if (isFunction(logging)) {
      console.warn('WARNING! logging param in cluster-dispatch will be removed in v3,' +
        ' please use logger param like log4js instead');
      return {
        info: logging,
        error: logging,
      };
    }
    return {
      info(msg) {
        console.log(`${name} ${msg}`);
      },
      error(msg) {
        if (msg instanceof Error) {
          console.error(`${name} ${msg.stack}`);
        } else {
          console.error(`${name} ${msg}`);
        }
      },
    };
  },
};

module.exports = util;
