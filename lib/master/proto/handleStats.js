var nextEvent = require('./nextEvent');

module.exports = function(callback) {
  var noOfWorkers = this.getWorkerPids().length;
  if (noOfWorkers === 0) {
    callback(this.getStats());
  }
  else {
    var eventId = nextEvent.call(this); 
    this.eventHash[eventId]= {
      count: 0,
      data: {
        master: this.getStats()
      },
      max: noOfWorkers
    };
    var hash = this.eventHash[eventId];
    hash.data.worker = [];
    hash.callback = callback;
    this.getAllWorkerStats(eventId);
  }
};