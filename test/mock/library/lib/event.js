'use strict';

const EventEmitter = require('events');

class Event extends EventEmitter {
  getTest() {
    return 'test';
  }
}

module.exports = new Event();
