'use strict';

const MailBox = require('socket-messenger').MailBox;
const Base = require('sdk-base');

const Handler = require('../library_handler');

const ENV_ROLE = process.env.ROLE;
const SOCK_PATH = process.env.SOCK_PATH;
const name = `${ENV_ROLE}`;


class Library extends Base {
  constructor({ logging, lib } = {}) {
    super();

    this.lib = lib;
    this.logging = logging;
    this.mailBox = new MailBox({ name, sockPath: SOCK_PATH });
    this.handler = new Handler({ lib, logging });
  }

  async init() {
    const { mailBox, handler } = this;

    await mailBox.init();
    process.send({ ready: true });

    await handler.init();

    handler.on('lib-event', params => this._onLibEventHandler(params));

    mailBox.on('mail', mail => this._onMailHandler(mail));

    this.ready(true);
  }

  _onLibEventHandler(params) {
    const { mailBox } = this;
    const eventName = params.eventName;
    const to = params.to;
    const args = params.args;

    mailBox.write().setTo(to)
        .setMessage({
          action: 'lib-event',
          eventName,
          args,
        })
        .send({ duplex: false });
  }

  _onMailHandler(mail) {
    const { handler } = this;
    const message = mail.message;
    const action = message.action;
    const data = message.data;

    switch (action) {
      case 'invokeLibrary':
        handler.invokeLibrary(mail, data);
        break;

      case 'getAgents':
        handler.getAgents(mail);
        break;

      /* istanbul ignore next */
      default:
        mail.reply('');
    }
  }
}

module.exports = Library;
