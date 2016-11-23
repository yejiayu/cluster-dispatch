'use strict';

const EventEmitter = require('events');
const MailBox = require('socket-messenger').MailBox;
const uuid = require('uuid');
const is = require('is-type-of');
const co = require('co');

const ENV_ROLE = process.env.ROLE;
const SOCK_PATH = process.env.SOCK_PATH;
const name = `${ENV_ROLE}@${process.pid}`;

class LibEvent extends EventEmitter {}

class Agent {
  constructor({ logging } = {}) {
    this.logging = logging;
    this.mailBox = new MailBox({ name, sockPath: SOCK_PATH });
    this.eventMap = new Map();
  }

  * init() {
    yield this.mailBox.init();
    process.send({ ready: true });

    this.mailBox.on('mail', mail => this.mailHandler(mail));

    const reply = yield this.mailBox.write()
        .setTo('LIBRARY')
        .setMessage({ action: 'getAgents' })
        .send();

    const agentObjs = reply.message;

    const keys = Object.keys(agentObjs);
    for (const key of keys) {
      const obj = agentObjs[key];

      const methodKeys = Object.keys(obj);
      for (const method of methodKeys) {
        obj[method] = this.invoke.bind(this, { objName: key, methodName: method });
      }

      this[key] = obj;
    }

    this.agentObjs = agentObjs;
  }

  invoke({ objName, methodName }, ...rest) {
    const { mailBox, eventMap, logging } = this;

    const args = Array.from(rest);

    const mail = mailBox.write().setTo('LIBRARY');
    const message = {
      action: 'invokeLibrary',
      data: { objName, methodName, args },
    };

    if (args.length > 0 && is.function(args[args.length - 1])) {
      const eventName = uuid();
      const callback = args[args.length - 1];
      const libEvent = new LibEvent();

      libEvent.on(eventName, callback);
      eventMap.set(eventName, libEvent);

      message.data.eventName = eventName;
      message.data.isEvent = true;

      return mail.setMessage(message).send({ duplex: false });
    }

    return co(function* gen() {
      const reply = yield mail.setMessage(message).send();

      return reply.message;
    }).catch(logging);
  }

  mailHandler(mail) {
    const { logging } = this;
    const { message } = mail;
    const { action } = message;

    switch (action) {
      case 'lib-event': {
        const { eventName, args } = message;
        const eventLib = this.eventMap.get(eventName);

        eventLib.emit(...[eventName].concat(args));
        break;
      }

      default:
        logging('default');
    }
  }
}

module.exports = Agent;
