'use strict';

const assert = require('assert');
const mm = require('mm');
const is = require('is-type-of');
const _ = require('lodash');
const debug = require('debug')('cluster-dispatch:test:agent');

const lib = _.cloneDeep(require('./mock/library/lib'));
const Agent = require('../').Agent;

let mailBox = null;
let agent = null;

describe('test/agent.test.js', () => {
  beforeEach(function* init() {
    mailBox = {};
    mm(mailBox, 'on', () => {});
    mm(mailBox, 'write', () => mailBox);
    mm(mailBox, 'setTo', () => mailBox);
    mm(mailBox, 'setMessage', () => mailBox);
    mm(mailBox, 'send', () => new Promise((resolve) => { resolve({ message: lib }); }));

    agent = new Agent({ logging: debug, mailBox });
    yield agent.init();
  });

  describe('init()', () => {
    it('agentObjs should typeof object', () => {
      assert(is.object(agent.agentObjs));
    });
  });

  describe('invoke()', () => {
    it('should name eq yejiayu', function* invoke() {
      mm(mailBox, 'send',
        () => new Promise((resolve) => resolve({ message: { name: 'yejiayu' } })));

      const result = yield agent.invoke('libDemo', 'getUserName');
      assert.equal(result.name, 'yejiayu');
    });
  });

  describe('mailHandler()', () => {
    it('should name eq yejiayu', function* () {
      let mockMessage = null;
      mm(mailBox, 'setMessage', data => {
        mockMessage = data;
        return mailBox;
      });
      yield agent.invoke('libDemo', 'getUserName', event);

      agent.mailHandler({
        message: {
          action: 'lib-event',
          eventName: mockMessage.data.eventName,
          args: { name: 'yejiayu' },
        },
      });

      function event(message) {
        assert.equal(message.name, 'yejiayu');
      }
    });
  });
});
