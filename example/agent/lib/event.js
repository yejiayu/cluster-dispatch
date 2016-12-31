'use strict';

const EventEmitter = require('events');

class Event extends EventEmitter {
  getTest(cb) {
    cb('emit test');
  }
}

module.exports = new Event();
