module.exports = function(message, callback) {
  message.callback = callback;
  this.addToQueue(message);
};