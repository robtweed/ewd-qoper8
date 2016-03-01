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

console.log('test-workerModule1 loaded into child process ' + process.pid);

var count = 0;

module.exports = function() {

  this.on('message', function(messageObj, send, finished) {

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

  this.on('stop', function() {
    console.log('Worker ' + process.pid + ': ' + JSON.stringify(this.getStats()));
  });
  
};

