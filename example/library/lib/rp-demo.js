'use strict';

module.exports = function* rpDemo() {
  console.log('rp demo 1');
  yield new Promise((resolve, reject) => {
    setTimeout(resolve, 10);
  });
  console.log('rp demo 2');

  return {
    getRpDemo() {
      console.log('getRpDemo');
      return 'rpDemo';
    },
  };
};
