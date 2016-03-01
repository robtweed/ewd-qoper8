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

var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();

q.on('start', function() {
  this.setWorkerPoolSize(2);
  this.worker.module = 'ewd-qoper8/lib/tests/example-worker-module';
});

q.on('started', function() {
  console.log(q.version() + ' running in process ' + process.pid);
  var noOfMessages = 5;
  var messageObj;
  for (var i = 0; i < noOfMessages; i++) {
    messageObj = {
      type: 'testMessage1',
      hello: 'world'
    };
    this.addToQueue(messageObj);
  }
});

q.start();

setTimeout(function() {
  console.log(q.getStats());
  q.getWorkerAvailability(function(available) {
    console.log('Worker availability: ' + JSON.stringify(available));
  });
  q.getAllWorkerStats();
}, 5000);

setTimeout(function() {
  q.stop();
}, 10000);

