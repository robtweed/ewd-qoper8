/*

 ----------------------------------------------------------------------------
 | ewd-qoper8: Node.js Queue and Multi-process Manager                      |
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

  1 March 2016

*/

var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var qx = require('ewd-qoper8-express');

var app = express();
app.use(bodyParser.json());

var q = new qoper8.masterProcess();
qx.addTo(q);

app.post('/qoper8', function (req, res) {
  qx.handleMessage(req, res);
});

app.get('/qoper8/test', function (req, res) {
  var request = {
    type: 'non-express-message',
    hello: 'world'
  };
  q.handleMessage(request, function(response) {
    res.send(response);
  });
});

app.get('/qoper8/fail', function (req, res) {
  var request = {
    type: 'unhandled-message',
  };
  q.handleMessage(request, function(response) {
    var message = response.message;
    if (message.error) {
      res.status(400).send(message);
    }
    else {
      res.send(message);
    }
  });
});

q.on('started', function() {
  this.worker.module = 'ewd-qoper8/lib/tests/express-module2';
  var server = app.listen(8080);
});

q.start();

