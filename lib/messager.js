'use strict';

const SDKBase = require('sdk-base');
const _ = require('lodash');

class Messager extends SDKBase {
  constructor() {
    super();

    process.on('message', data => {
      if (data.to === 'app') {
        delete data.to;
        this.emit('app', data);
      } else if (data.to === 'library') {
        delete data.to;
        this.emit('library', data);
      }
    });

    this.ready(true);
  }

  sendToApp(data) {
    process.send(_.merge({ to: 'app' }, data));
  }

  sendToLibrary(data) {
    process.send(_.merge({ to: 'library' }, data));
  }
}

const messager = new Messager();
module.exports = messager;
