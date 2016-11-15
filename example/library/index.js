'use strict';

const MailBox = require('socket-messenger').MailBox;
const co = require('co');
const debug = require('debug')('cluster:library');

const agent = require('./agent');

const ENV_ROLE = process.env.ROLE;
const SOCK_PATH = process.env.SOCK_PATH;
const name = `${ENV_ROLE}`;

const handler = {
  getAgents() {
    return agent;
  },
};

co(function* gen() {
  const mailBox = new MailBox({ name, sockPath: SOCK_PATH });
  yield mailBox.init();

  mailBox.on('mail', mail => {
    console.log('on mail');
    const { action, data } = mail.message;
    const result = handler[action](data);
    mail.reply(result);
  });

  process.send({ ready: true });
  // yield mailBox.writeMails()
  //     .setTo('APP@\\w+')
  //     .setMessage({
  //       action: 'send_objs',
  //       objs: agent,
  //     })
  //     .send({ duplex: false });
}).catch(debug);
