'use strict';

const assert = require('assert');
const debug = require('debug')('cluster-dispatch:test:library_handler');
const EventEmitter = require('events');
const _ = require('lodash');

const Handler = require('../lib/library_handler');
const lib = _.cloneDeep(require('./mock/agent/lib'));

class Mail extends EventEmitter {
  reply() {
    this.emit('reply', arguments);
  }
}
describe('test/library_handler.test.js', () => {
  describe('init()', () => {
    it('should success', function* () {
      const handler = new Handler({
        logging: debug,
        lib,
      });

      yield handler.init();
    });
  });

  describe('invokeLibrary()', () => {
    it('invoke function', function* () {
      const handler = new Handler({
        logging: debug,
        lib,
      });
      yield handler.init();
      const mail = new Mail();

      mail.from = 'test';
      mail.on('reply', data => {
        const message = data[0];
        assert.equal(message.name, 'yejiayu');
      });

      handler.invokeLibrary(mail, {
        objName: 'demoLib',
        methodName: 'getUserName',
        args: ['yejiayu'],
        isEvent: false,
      });
    });

    it('invoke event', function* () {
      const handler = new Handler({
        logging: debug,
        lib,
      });
      yield handler.init();
      const mail = new Mail();

      mail.from = 'test';
      handler.on('lib-event', (data) => {
        assert.equal(data.eventName, 'test-emit');
      });
      handler.invokeLibrary(mail, {
        objName: 'event',
        methodName: 'getTest',
        args: [() => {}],
        isEvent: true,
        eventName: 'test-emit',
      });
    });

    it('invoke promise', function* () {
      const handler = new Handler({
        logging: debug,
        lib,
      });
      yield handler.init();
      const mail = new Mail();

      mail.from = 'test';
      mail.on('reply', data => {
        const message = data[0];
        assert.equal(message.name, 'yejiayu');
      });

      handler.invokeLibrary(mail, {
        objName: 'demoLib',
        methodName: 'getUserNameByPromise',
        args: ['yejiayu'],
        isEvent: false,
      });
    });

    it('invoke gen', function* () {
      const handler = new Handler({
        logging: debug,
        lib,
      });
      yield handler.init();
      const mail = new Mail();

      mail.from = 'test';
      mail.on('reply', data => {
        const message = data[0];
        assert.equal(message.name, 'yejiayu');
      });

      handler.invokeLibrary(mail, {
        objName: 'demoLib',
        methodName: 'getUserNameByGen',
        args: ['yejiayu'],
        isEvent: false,
      });
    });

    it('invoke field', function* () {
      const handler = new Handler({
        logging: debug,
        lib,
      });
      yield handler.init();
      const mail = new Mail();

      mail.from = 'test';
      mail.on('reply', data => {
        const message = data[0];
        assert.equal(message, 'yejiayu');
      });

      handler.invokeLibrary(mail, {
        objName: 'demoLib',
        methodName: 'name',
        isEvent: false,
      });
    });
  });
});
