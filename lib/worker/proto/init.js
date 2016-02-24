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

var messageHandler = require('./messageHandler');

function init() {

  var workerListeners;
  if (process.argv[2] && process.argv[2] !== 'undefined') {
    console.log('process.argv[2] = ' + process.argv[2]);
    workerListeners = require(process.argv[2]);
  }
  else {
    workerListeners = require('ewd-qoper8/lib/worker/defaultModule');
  }

  var wl = new workerListeners(this);
  var worker = this;

  process.on('message', function(messageObj) {
    messageHandler.call(worker, messageObj);
  });

  process.on( 'SIGINT', function() {
    console.log('Child Process ' + process.pid + ' detected SIGINT (Ctrl-C) - ignored');
  });

  process.on( 'SIGTERM', function() {
    console.log('Child Process ' + process.pid + ' detected SIGTERM signal - ignored');
  });

  this.startTime = new Date().getTime();

};

module.exports = init;
