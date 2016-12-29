'use strict';

const path = require('path');
const debug = require('debug')('cluster-dispatch:test:master');

const Master = require('../').Master;

describe('test/master.test.js', () => {
  it('init()', function* () {
    const master = new Master({
      baseDir: path.join(__dirname, './mock'),
      appPath: './mock/index.js',
      libraryPath: './mock/library/index.js',
      logging: debug,
    });

    yield master.init();
  });
});
