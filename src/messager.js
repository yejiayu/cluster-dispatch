'use strict';

const cluster = require('cluster');
const assert = require('assert');
const debug = require('debug')('cluster:messager');

const EventEmitter = require('events');
const is = require('is-type-of');

const ROLE = require('./constant/role');
const { generateRequestId } = require('./util');

const IS_SELF = Symbol('is_self');
const BIND = Symbol('bind_handler');
const PROCESS_MESSAGE_HANDLER = Symbol('process_message_handler');
const GENERATE_REQUEST = Symbol('generate_request');

class Messager extends EventEmitter {
  constructor() {
    super();

    this.SELF_ROLE = cluster.isMaster ? ROLE.MASTER : process.env.ROLE;
    this.autoIncrement = 0;

    assert(is.string(this.SELF_ROLE), 'process.env.ROLE required');
    assert(Object.keys(ROLE).findIndex(role => role === this.SELF_ROLE) !== -1,
        'process.env.ROLE value illegal');

    this[BIND]();
  }

  [BIND]() {
    process.on('message', message => this[PROCESS_MESSAGE_HANDLER](message));
  }

  sendToMaster(data, isSentOnce = true) {
    if (this[IS_SELF](ROLE.MASTER)) {
      return;
    }

    process.send({
      form: this.SELF_ROLE,
      to: ROLE.MASTER,
      data,
      condition: { isSentOnce },
    });
  }

  sendToApp(data, isSentOnce = true) {
    if (this[IS_SELF](ROLE.MASTER)) {
      return;
    }

    process.send({
      form: this.SELF_ROLE,
      to: ROLE.APP,
      data,
      condition: { isSentOnce },
    });
  }

  sendToLibrary(data, isSentOnce = true) {
    if (this[IS_SELF](ROLE.MASTER)) {
      return;
    }

    process.send({
      form: this.SELF_ROLE,
      to: ROLE.LIBRARY,
      data,
      condition: { isSentOnce },
    });
  }

  sendToPid(pid, data) {
    if (process.pid === pid) {
      return;
    }

    process.send({
      form: this.SELF_ROLE,
      to: pid,
      data,
    });
  }

  [IS_SELF](role) {
    return this.SELF_ROLE === role;
  }

  [PROCESS_MESSAGE_HANDLER](message) {
    const { to } = message;
    assert(is.undefined(to) || is.null(to), 'message.to required');

    if (this.SELF_ROLE === ROLE.MASTER
        || to === this.SELF_ROLE) {
      this.emit('message', message);
    }
  }

  [GENERATE_REQUEST](message, condition) {
    this.autoIncrement += 1;
    const id = generateRequestId(this.SELF_ROLE, this.autoIncrement);

    return {
      id,
      message,
      condition,
      isRequest: true,
    };
  }
}

module.exports = Messager;
