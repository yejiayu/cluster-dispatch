'use strict';

const co = require('co');
const EventEmitter = require('events');
const is = require('is-type-of');

const { parseAgents } = require('./util');

class Handler extends EventEmitter {
  constructor({ logging, lib } = {}) {
    super();

    this.lib = lib;
    this.agentLib = parseAgents(lib);
    this.logging = logging;
  }

  getAgents(mail) {
    mail.reply(this.agentLib);
  }

  invokeLibrary(mail, invokeParams) {
    if (!invokeParams) {
      return;
    }
    const { lib } = this;
    const { objName, methodName, args, isEvent, logging } = invokeParams;
    const method = lib[objName][methodName];
    const that = this;

    co(function* gen() {
      if (isEvent) {
        const eventName = invokeParams.eventName;
        const to = mail.from;
        args[args.length - 1] = function fn(...rest) {
          that.emit('lib-event', { eventName, to, args: Array.from(rest) });
        };
        method.apply(lib[objName], args);
        return;
      }

      let result = null;
      if (is.promise(method)) {
        result = yield method.apply(lib[objName], args);
      } else {
        const fn = method.apply(lib[objName], args);
        if (is.generator(fn)) {
          result = yield fn;
        }
      }
      mail.reply(result);
    }).catch(logging);
  }
}


module.exports = Handler;
