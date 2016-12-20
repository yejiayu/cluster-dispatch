'use strict';

const fs = require('fs');
const debug = require('debug')('cluster:util');
const EventEmitter = require('events');

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

  parseAgents(library) {
    const result = {};
    for (const key of Object.keys(library)) {
      result[key] = util.getMethodByProto(library[key]);
    }

    return result;
  },

  getMethodByProto(obj) {
    const result = {};

    if (obj instanceof EventEmitter) {
      const eventMethods = Object.getOwnPropertyNames(EventEmitter.prototype);
      for (const methodKey of eventMethods) {
        result[methodKey] = { type: typeof EventEmitter[methodKey], from: 'super' };
      }
    }

    const prototypeKeys = Object.getOwnPropertyNames(obj.constructor.prototype);
    for (const prototypeKey of prototypeKeys) {
      if (!prototypeKey.startsWith('_')) {
        const type = typeof obj[prototypeKey];

        result[prototypeKey] = { type, from: 'prototype' };
      }
    }

    const fieldKeys = Object.getOwnPropertyNames(obj);
    for (const fieldKey of fieldKeys) {
      if (!fieldKey.startsWith('_')) {
        const type = typeof obj[fieldKey];

        result[fieldKey] = { type, from: 'field' };
      }
    }

    return result;
  },
};

module.exports = util;
