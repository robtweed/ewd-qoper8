var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var qx = require('ewd-qoper8-express');

var app = express();
app.use(bodyParser.json());

var q = new qoper8.masterProcess();
qx.addTo(q);

app.get('/qoper8/pass', function (req, res) {
  qx.handleMessage(req, res);
});

app.get('/qoper8/fail', function (req, res) {
  qx.handleMessage(req, res);
});

app.get('/qoper8/nohandler', function (req, res) {
  qx.handleMessage(req, res);
});

q.on('started', function() {
  this.worker.module = 'ewd-qoper8/lib/tests/express-module3';
  var server = app.listen(8080);
});

q.start();