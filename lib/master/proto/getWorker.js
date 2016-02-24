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

function getWorker() {
  var pid;
  var count = 0;
  // try to find a worker process, otherwise return false
  //for (pid in this.worker.process) {
  var len = this.worker.list.length;
  var worker;
  for (var i = 0; i < len; i++) {
    pid = this.worker.list[i];
    count++;
    worker = this.worker.process[pid];
    if (worker.isAvailable) {
      worker.isAvailable = false;
      worker.time = new Date().getTime();
      worker.totalRequests++;
      return {
        pid: pid
      };
    }
  }
  worker = null;
  return {
    pid: false,
    count: count
  };
};

module.exports = getWorker;
