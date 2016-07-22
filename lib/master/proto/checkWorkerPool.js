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

  22 July 2016

*/

function checkWorkerPool() {
  var q = this;
  // check every 5 minutes to see whether any idle child processes can be shut down
  //  thanks to Ward De Backer for improvements to this part of ewd-qoper8's logic
  this.checkWorkerPoolTimer = setInterval(function() {
    var lastActivity;
    var elapsed;
    var pid;
    for (var i = 0; i < q.worker.list.length; i++) {
      pid = q.worker.list[i];
      elapsed = new Date().getTime() - q.worker.process[pid].time;
      if (q.log) console.log(pid + ': idle for ' + elapsed + ' (limit = ' + q.worker.idleLimit + '); Available: ' + q.worker.process[pid].isAvailable);
      if (elapsed > q.worker.idleLimit) {
        q.stopWorker(pid);
        i--;
      }
    }
  },300000);
};

module.exports = checkWorkerPool;
