'use strict';

const co = require('co');
const { merge } = require('lodash');
const { EventEmitter } = require('events');
const is = require('is-type-of');
const CircularJSON = require('circular-json');

class Handler extends EventEmitter {
  constructor({ logging, lib } = {}) {
    super();

    this.lib = lib;
    this.parsedLib = null;
    this.logging = logging;
  }

  async init() {
    const { lib } = this;
    this.parsedLib = await parseLib(lib);
    this.libSignature = getLibSignature(this.parsedLib);
  }

  getAgents(mail) {
    mail.reply(this.libSignature);
  }

  invokeLibrary(mail, invokeParams) {
    if (!invokeParams) {
      return;
    }
    const { parsedLib, logging } = this;
    const { objName, methodName, args, isEvent } = invokeParams;
    const attr = parsedLib[objName][methodName];
    const that = this;

    (async function invoke() {
      if (isEvent) {
        const eventName = invokeParams.eventName;
        const to = mail.from;
        args[args.length - 1] = function fn(...rest) {
          that.emit('lib-event', { eventName, to, args: Array.from(rest) });
        };
        attr.apply(parsedLib[objName], args);
      } else {
        const result = await invokeFieldOrMethod({
          ctx: parsedLib[objName],
          attr,
          args,
        });

        // 有的方法会返回this JSON.stringify会循环引用
        if (is.object(result)) {
          mail.reply(JSON.parse(CircularJSON.stringify(result)));
        } else {
          mail.reply(result);
        }
      }
    }()).catch(logging);
  }
}

module.exports = Handler;

async function parseLib(library) {
  const result = {};
  for (const key of Object.keys(library)) {
    const lib = await library[key];

    result[key] = await invokeFieldOrMethod({
      ctx: library,
      attr: lib,
    });
  }

  return result;
}

function getLibSignature(lib) {
  const result = {};
  for (const key of Object.keys(lib)) {
    result[key] = getMethodByProto(lib[key]);
  }

  return result;
}

function getMethodByProto(obj) {
  const prototypeKeys = Object.getOwnPropertyNames(obj);

  const result = prototypeKeys
      .filter(key => !key.startsWith('_'))
      .reduce((cur, pre) => {
        cur[pre] = { key: pre };
        return cur;
      }, {});

  const prototypeObj = Object.getPrototypeOf(obj);

  if (!prototypeObj) {
    return {};
  }
  return merge(result, getMethodByProto(prototypeObj));
}

async function invokeFieldOrMethod({ ctx, attr, args }) {
  if (is.function(attr)) {
    const result = await attr.apply(ctx, args);
    if (is.generator(result)) {
      return await co.wrap(attr).apply(ctx, args);
    }

    return result;
  } else if (is.generator(attr)) {
    return await co.wrap(attr).apply(ctx, args);
  }

  return attr;
}
