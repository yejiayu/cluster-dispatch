'use strict';

module.exports = function* rpDemo() {
  yield new Promise((resolve) => {
    setTimeout(resolve, 10);
  });

  return {
    getRpDemo() {
      return 'rpDemo';
    },
  };
};
