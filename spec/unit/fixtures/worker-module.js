'use script';

module.exports = function() {

  this.on('message', function(messageObj, send, finished) {
    var response = {
      type: 'test-worker-module'
    };
    finished(response);
  });

};

