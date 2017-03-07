'use strict';

module.exports = async () => {
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 10);
  });

  return {
    getRpDemo() {
      return 'rpDemo';
    },
  };
};
