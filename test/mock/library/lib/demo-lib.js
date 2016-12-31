'use strict';

const demoLib = {
  getUserName() {
    return { name: 'yejiayu' };
  },

  getUserNameByPromise() {
    return new Promise((resolve) =>
       resolve({ name: 'yejiayu' })
    );
  },

  * getUserNameByGen() {
    return yield new Promise((resolve) =>
       resolve({ name: 'yejiayu' })
    );
  },
};

module.exports = demoLib;
