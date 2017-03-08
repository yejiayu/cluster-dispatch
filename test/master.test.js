'use strict';

const assert = require('assert');
const path = require('path');
const debug = require('debug')('cluster-dispatch:test:master');
const request = require('request-promise');

const Master = require('../').Master;

describe('test/master.test.js', () => {
  it('init()', function* () {
    const master = new Master({
      baseDir: path.join(__dirname, './mock'),
      appPath: 'index.js',
      libraryPath: 'agent/lib/index.js',
      logging: debug,
    });

    yield master.init();

    yield new Promise((resolve, reject) => {
      setTimeout(() => {
        request('http://127.0.0.1:8000').then(result => {
          assert.equal(JSON.parse(result).name, 'yejiayu');
          return resolve();
        });
      }, 2000);
    });
  });
});
