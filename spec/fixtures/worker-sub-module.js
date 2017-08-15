'use script';

module.exports.handler = function() {

  this.on('message', function(messageObj, send, finished) {
    var response = {
      type: 'test-worker-sub-module'
    };
    finished(response);
  });

};
