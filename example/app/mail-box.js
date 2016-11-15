'use strict';

const MailBox = require('socket-messenger').MailBox;

const ENV_ROLE = process.env.ROLE;
const SOCK_PATH = process.env.SOCK_PATH;
const name = `${ENV_ROLE}@${process.pid}`;

const mailBox = new MailBox({ name, sockPath: SOCK_PATH });

module.exports = mailBox;
