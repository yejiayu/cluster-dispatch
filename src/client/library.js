'use strict';

const MailBox = require('socket-messenger').MailBox;
const Base = require('sdk-base');

const Handler = require('../library_handler');

const ENV_ROLE = process.env.ROLE;
const SOCK_PATH = process.env.SOCK_PATH;
const name = `${ENV_ROLE}`;


class Library extends Base {
  constructor({ logging } = {}) {
    super();

    this.logging = logging;
  }

  * init() {
    const mailBox = new MailBox({ name, sockPath: SOCK_PATH });
    yield mailBox.init();
    process.send({ ready: true });

    const handler = new Handler();

    handler.on('lib-event', (params) => {
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
    });

    mailBox.on('mail', mail => {
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

        default:
          mail.reply('');
      }
    });

    this.ready(true);
  }
}

module.exports = Library;
