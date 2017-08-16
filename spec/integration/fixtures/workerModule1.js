'use strict';

module.exports = function () {

  this.on('start', function () {
    if (this.log) {
      console.log('Worker process ' + process.pid + ' starting...');
    }
  });

  this.on('message', function (messageObj, send, finished) {
    var response = {
      hello: 'world'
    };
    finished(response);
  });

  this.on('stop', function () {
    if (this.log) {
      console.log('Worker process ' + process.pid + ' stopping...');
    }
  });

};
