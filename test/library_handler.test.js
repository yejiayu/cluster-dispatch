'use strict';

const debug = require('debug')('cluster-dispatch:test:library_handler');
const EventEmitter = require('events');
const _ = require('lodash');

const Handler = require('../lib/library_handler');
const lib = _.cloneDeep(require('./mock/library/lib'));

class Mail extends EventEmitter {
  reply(...rest) {
    this.emit('reply', rest);
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
        debug(data);
      });

      handler.invokeLibrary(mail, {
        objName: 'demoLib',
        methodName: 'getUserName',
        args: [],
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
      handler.invokeLibrary(mail, {
        objName: 'demoLib',
        methodName: 'getUserName',
        args: [],
        isEvent: true,
      });
    });
  });
});
