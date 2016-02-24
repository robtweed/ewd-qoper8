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

var cp = require('child_process');

function startWorker() {
  /*
  if (params && params.debug) {
    params.debug.worker_port++;
    process.execArgv.push('--debug=' + params.debug.worker_port);
  }
  */
  var args = [
    this.worker.module
  ];

  var workerProcess = cp.fork(this.worker.loaderFilePath, args, {env: process.env});
  var q = this;

  workerProcess.on('message', function(responseObj) {
    if (q.log) console.log('master process received response from worker ' + this.pid + ': ' + JSON.stringify(responseObj));
    var worker = q.worker.process[this.pid];
    if (responseObj.type === 'workerProcessStarted') {
      worker.isAvailable = true;
      worker.time = new Date().getTime();
      worker.totalRequests = 0;
      q.emit('workerStarted', this.pid);
      return;
    }
    var finished = (responseObj.finished === true);
    q.emit('response', responseObj, this.pid);
    if (finished) {
      if (q.log) console.log('Master process has finished processing response from worker process ' + this.pid + ' which is back in available pool');
      // this check for worker is needed as custom onResponse may have stopped it
      if (worker) {
        worker.isAvailable = true;
        worker.time = new Date().getTime();
      }
      // now that this worker is available, process the queue again
      if (q.queue.length > 0) q.processQueue();      
    }
  });

  workerProcess.isAvailable = false;

  // Now that worker has started, fire off handshake message
  // and send it any custom initialisation / environment logic

  workerProcess.send({
    type: 'qoper8-start',
    log: this.log,
    isFirst: !this.started,
    //customObj: this.customObj
  });
  this.started = true;
  // finally add worker process object to worker process array
  this.worker.process[workerProcess.pid] = workerProcess;
  // rebuild array of current worker process pids
  this.worker.list = [];
  for (pid in this.worker.process) {
    this.worker.list.push(pid);
  }
};

module.exports = startWorker;
