'use strict';

const EventEmitter = require('events');
const uuid = require('uuid');
const is = require('is-type-of');

class LibEvent extends EventEmitter {}

class Agent {
  constructor({ logging, mailBox } = {}) {
    this._logging = logging;
    this._mailBox = mailBox;
    this._eventMap = new Map();
  }

  async init() {
    this._mailBox.on('mail', mail => this.mailHandler(mail));

    const reply = await this._mailBox.write()
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
    const { _mailBox, _eventMap } = this;

    const args = Array.from(rest);

    const mail = _mailBox.write().setTo('LIBRARY');
    const message = {
      action: 'invokeLibrary',
      data: { objName, methodName, args },
    };

    // 这里判断最后一个参数是不是function,
    // 如果是function就默认为监听了一个事件
    if (args.length > 0 && is.function(args[args.length - 1])) {
      const eventName = uuid();
      const callback = args[args.length - 1];
      const libEvent = new LibEvent();

      libEvent.on(eventName, callback);
      _eventMap.set(eventName, libEvent);

      message.data.eventName = eventName;
      message.data.isEvent = true;

      return mail.setMessage(message).send({ duplex: false });
    }

    return (async() => {
      const reply = await mail.setMessage(message).send();

      return reply.message;
    })();
  }

  mailHandler(mail) {
    const { _logging } = this;
    const { message } = mail;
    const { action } = message;

    switch (action) {
      case 'lib-event': {
        const { eventName, args } = message;
        const eventLib = this._eventMap.get(eventName);

        eventLib.emit(...[eventName].concat(args));
        break;
      }

      default:
        _logging.info('default');
    }
  }
}

let _agent = null;
module.exports = {
  RawAgent: Agent,

  setAgent(agent) {
    _agent = agent;
  },

  getAgent() {
    return _agent;
  },
};
