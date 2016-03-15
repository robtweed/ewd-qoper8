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

function processQueue(customQueue) {
  if (this.stopping) return;
  if (!customQueue && this.queue.length === 0) return;
  var result = this.getWorker();
  //console.log('processQueue - result = ' + JSON.stringify(result));
  if (result.pid) {
    // see if user has defined a custom mechanism for dispatching a queued item to worker
    var handlerFound = this.emit('dispatch', result.pid);
    if (!handlerFound) {
      this.sendRequestToWorker(result.pid);
      // if there's any more requests on the queue, process the first one
      if (this.log) console.log('checking if more on queue');
      if (this.queue.length > 0) {
        if (this.log) console.log('more items found on queue - processing again');
        var q = this;
        q.processQueue();
      }
    }
  }
  else {
    // no workers were available
    // start a new one unless maximum pool size has been exceeded
    if (this.log) console.log('no available workers');
    if (result.count < this.worker.poolSize) {
      this.startWorker(customQueue);
    }
  }
};

module.exports = processQueue;
