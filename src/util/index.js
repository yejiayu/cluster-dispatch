'use strict';

const fs = require('fs');
const { isFunction, isObject, has } = require('lodash');

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
      console.warn('WARNING!' +
        'logging should be an Object with error and debug Functions like console');
      return {
        info: logging,
        error: logging,
      };
    }

    if (isObject(logging) && has(logging, 'debug') && has(logging, 'error')) {
      return logging;
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
