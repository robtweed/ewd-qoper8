/*

 ----------------------------------------------------------------------------
 | ewd-qoper8.js: Node.js Queue and Multi-process Manager                   |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  24 January 2016

*/

var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');

var app = express();
app.use(bodyParser.json());

var q = new qoper8.masterProcess();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

q.on('started', function() {
  this.worker.module = 'ewd-qoper8/lib/tests/express-module1';
  var q = this;

  var server = app.listen(8080);
  var io = require('socket.io')(server);

  io.on('connection', function (socket) {
    socket.on('my-request', function (data) {
      q.handleMessage(data, function(resultObj) {
        delete resultObj.finished;
        socket.emit('my-response', resultObj);
      });
    });
  });

});

q.start();

