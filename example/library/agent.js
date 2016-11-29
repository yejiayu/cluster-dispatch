'use strict';

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

module.exports = (function fn() {
  const result = {};

  const objKeys = Object.keys(objs);
  for (const objKey of objKeys) {
    const obj = objs[objKey];

    const fieldKeys = Object.keys(obj);
    result[objKey] = {};
    for (const fieldKey of fieldKeys) {
      const type = typeof obj[fieldKey];

      result[objKey][fieldKey] = { type };
    }
  }

  return result;
}());
