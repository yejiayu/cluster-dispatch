'use strict';

const assert = require('assert');

describe('test/es6.test.js', () => {
  it('es6 default param', () => {
    function defaultParam({ test1 = 1, test2 = 2, test3 = 3 } = {}) {
      return { test1, test2, test3 };
    }

    const { test1, test2, test3 } = defaultParam({ test1: 2 });

    assert.equal(test1, 2);
    assert.equal(test2, 2);
    assert.equal(test3, 3);
  });
});
