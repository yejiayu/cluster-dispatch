'use strict';

const logger = require('../lib/logger')('index:test');

// const Dispatch = require('../lib/dispatch');

const Dispatch = require('../lib/dispatch');
new Dispatch();

// dispatch.on('app-mesaage', data => {
//   logger.info(data.name);
//   logger.info(data.message);
//   dispatch.sendToLibrary({
//     name: 'dts-client',
//     message: 'xxx',
//   });
// });

// dispatch.on('dts-client', data => {
//   logger.info(data.name); // library name
//   logger.info(data.message);

//   dispatch.sendToApp({
//     message: 'xxx',
//   });
// });
