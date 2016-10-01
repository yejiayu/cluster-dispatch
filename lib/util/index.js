'use strict';

const fs = require('fs');

module.exports = {
  exists(path) {
    try {
      const file = fs.statSync(path);
      if (!file || !file.isFile()) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  },
};
