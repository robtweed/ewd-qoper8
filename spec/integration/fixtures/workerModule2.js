'use strict';

var count = 0;

module.exports = function () {

  this.on('message', function (messageObj, send, finished) {

    send({
      info: 'intermediate message',
      pid: process.pid
    });

    count++;

    var results = {
      count: count,
      time: new Date().toString()
    };

    finished(results);
  });

  this.on('stop', function () {
    if (this.log) {
      console.log('Worker ' + process.pid + ': ' + JSON.stringify(this.getStats()));
    }
  });

};
