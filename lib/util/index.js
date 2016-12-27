'use strict';

var fs = require('fs');
var debug = require('debug')('cluster:util');

var util = {
  exists(path) {
    try {
      var file = fs.statSync(path);
      if (!file || !file.isFile()) {
        return false;
      }

      return true;
    } catch (error) {
      debug(error);
      return false;
    }
  },

  generateRequestId(prefix, NO) {
    return `${ prefix }#${ NO }`;
  }

};

module.exports = util;