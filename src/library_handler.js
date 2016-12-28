'use strict';

const co = require('co');
const EventEmitter = require('events');
const is = require('is-type-of');

class Handler extends EventEmitter {
  constructor({ logging, lib } = {}) {
    super();

    this.lib = lib;
    this.parsedLib = null;
    this.logging = logging;
  }

  * init() {
    const { lib } = this;
    this.parsedLib = yield parseLib(lib);
    this.libSignature = getLibSignature(this.parsedLib);
  }

  getAgents(mail) {
    mail.reply(this.libSignature);
  }

  invokeLibrary(mail, invokeParams) {
    if (!invokeParams) {
      return;
    }
    const { parsedLib } = this;
    const { objName, methodName, args, isEvent, logging } = invokeParams;
    const method = parsedLib[objName][methodName];
    const that = this;

    co(function* gen() {
      if (isEvent) {
        const eventName = invokeParams.eventName;
        const to = mail.from;
        args[args.length - 1] = function fn(...rest) {
          that.emit('lib-event', { eventName, to, args: Array.from(rest) });
        };
        method.apply(parsedLib[objName], args);
      } else {
        let result = null;

        if (is.promise(method)) {
          result = yield method.apply(parsedLib[objName], args);
        } else {
          result = method.apply(parsedLib[objName], args);

          if (is.generator(result) || is.promise(result)) {
            result = yield result;
          }
        }

        mail.reply(result);
      }
    }).catch(logging);
  }
}

module.exports = Handler;

function parseLib(library) {
  return function* () {
    const result = {};
    for (const key of Object.keys(library)) {
      let lib = library[key];

      if (is.promise(lib)) {
        lib = yield lib;
      } else if (is.function(lib)) {
        const gen = lib();
        lib = is.generator(gen) ? yield lib : lib;
      }
      result[key] = lib;
    }

    return result;
  };
}

function getLibSignature(lib) {
  const result = {};
  for (const key of Object.keys(lib)) {
    result[key] = getMethodByProto(lib[key]);
  }

  return result;
}

function getMethodByProto(obj) {
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
}
