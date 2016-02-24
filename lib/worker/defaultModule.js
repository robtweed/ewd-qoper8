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

console.log('No worker module was specified, so');
console.log('defaultModule loaded into child process ' + process.pid);

function workerListeners(worker) {
  worker.on('start', function() {
    if (this.log) console.log('Worker process ' + process.pid + ' starting...');
  });

  worker.on('message', function(messageObj) {
    if (this.log) console.log('Worker ' + process.pid + ': no handler defined for message ' + JSON.stringify(messageObj));
    this.hasFinished(messageObj.type);
  });

  worker.on('stop', function() {
    if (this.log) console.log('Worker process ' + process.pid + ' stopping...');
  });
  
};

module.exports = workerListeners;