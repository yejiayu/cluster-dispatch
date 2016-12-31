'use strict';

const demoLib = {
  getUserName(name) {
    return { name };
  },

  getUserNameByPromise(name) {
    return new Promise((resolve) =>
       resolve({ name })
    );
  },

  * getUserNameByGen(name) {
    return yield new Promise((resolve) =>
       resolve({ name })
    );
  },
};

module.exports = demoLib;
