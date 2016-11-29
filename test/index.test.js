'use strict';

const Library = require('../src/agent/library');
const mailBox = require('../example/app/mailBox');
const co = require('co');

const objs = {
  hsfClient: {
    invoke() {
      console.log('invoke');
    },
    getName() {
      console.log('get name');
    },
  },

  dtsClient: {
    getConfig() {
      console.log('get config');
    },
    getTask() {
      console.log('get task');
    },
  },
};
console.log(JSON.stringify(objs));
const library = new Library({ objs, mailBox });

co(function* gen() {
  yield library.hsfClient.getName('invoke', [1, 2]);
  yield library.hsfClient.invoke();
  yield library.dtsClient.getConfig();
}).catch(error => console.error(error.stack));
