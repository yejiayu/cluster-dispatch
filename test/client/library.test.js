'use strict';

const mm = require('mm');
const MailBox = require('socket-messenger').MailBox;
const debug = require('debug')('cluster-dispatch:test:client:app');

const lib = require('../mock/library/lib');
const LibraryClient = require('../../').LibraryClient;
const Handler = require('../../lib/library_handler');

describe('test/client/library.test.js', () => {
  beforeEach(() => {
    mm(MailBox, 'constructor', () => {});
    mm(Handler, 'constructor', () => {});
  });

  describe('init()', () => {
    it('should success', function* init() {
      const libraryClient = new LibraryClient({
        logging: debug,
        lib,
      });
      mm(libraryClient.handler, 'init', () => new Promise((resolve) => resolve()));
      mm(libraryClient.handler, 'on', () => {});
      mm(libraryClient.mailBox, 'init', () => new Promise((resolve) => resolve()));
      mm(libraryClient.mailBox, 'on', () => {});

      yield libraryClient.init();
    });
  });

  describe('_onLibEventHandler()', () => {
    it('should success', () => {
      const libraryClient = new LibraryClient({
        logging: debug,
        lib,
      });

      mm(libraryClient.mailBox, 'write', () => libraryClient.mailBox);
      mm(libraryClient.mailBox, 'setTo', () => libraryClient.mailBox);
      mm(libraryClient.mailBox, 'setMessage', () => libraryClient.mailBox);
      mm(libraryClient.mailBox, 'send', () => () => {});

      libraryClient._onLibEventHandler({
        eventName: 'eventName',
        to: 'to',
        args: 'args',
      });
    });
  });

  describe('_onMailHandler()', () => {
    it('invokeLibrary', () => {
      const libraryClient = new LibraryClient({
        logging: debug,
        lib,
      });
      mm(libraryClient.handler, 'invokeLibrary', () => {})
      mm(libraryClient.handler, 'getAgents', () => {})

      libraryClient._onMailHandler({
        message: {
          action: 'invokeLibrary',
          data: '',
        }
      });
    });

    it('getAgents', () => {
      const libraryClient = new LibraryClient({
        logging: debug,
        lib,
      });
      mm(libraryClient.handler, 'invokeLibrary', () => {})
      mm(libraryClient.handler, 'getAgents', () => {})

      libraryClient._onMailHandler({
        message: {
          action: 'getAgents',
          data: '',
        }
      });
    });
  });
});
