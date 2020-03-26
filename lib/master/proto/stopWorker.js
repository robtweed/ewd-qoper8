/*

 ----------------------------------------------------------------------------
 | ewd-qoper8.js: Node.js Queue and Multi-process Manager                   |
 |                                                                          |
 | Copyright (c) 2016-17 M/Gateway Developments Ltd,                        |
 | Redhill, Surrey UK.                                                      |
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

  15 August 2017

  Thanks to Alexey Kucherenko for code enhancements

*/

function stopWorker(pid) {
  console.log('signalling worker ' + pid + ' to stop');
  if (pid && this.worker.process[pid]) {
    this.worker.process[pid].send({
      type: 'qoper8-exit'
    });

    delete this.worker.process[pid];
  }
  // rebuild array of current worker process pids
  this.worker.list = [];
  for (pid in this.worker.process) {
    this.worker.list.push(parseInt(pid, 10));
  }
};

module.exports = stopWorker;
