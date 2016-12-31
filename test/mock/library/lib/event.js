'use strict';

const EventEmitter = require('events');

class Event extends EventEmitter {
  getTest(...rest) {
    const [cb] = rest;
    cb('emit test');
  }
}

module.exports = new Event();
