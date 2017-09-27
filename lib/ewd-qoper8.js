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

  Thanks to Ward DeBacker for addition of debugging functionality
  Thanks to Alexey Kucherenko for code enhancements and tests

*/

var events = require('events');

// Contents of Child Process file

var loaderFile = require('./worker/loaderFile');

//  Master Process Logic

var build = require('./build');

var qoper8 = function() {
  this.moduleName = 'ewd-qoper8';
  this.build = build;
  this.log = true;
  this.checkWorkerPoolDelay = 300000; // how long to wait to check if child processes can be shut down
  this.shutdownDelay = 20000; // how long to wait if haven't received exit event from all child processes
  this.worker = {
    idleLimit: 3600000, // 1 hour before inactive child process is shut down
    poolSize: 1,
    loaderFilePath: 'node_modules/ewd-qoper8-worker.js',
    loaderText: loaderFile,
    process: {},
    list: [],
    debugPort: 0,
    inspectPort: 0
  };
  this.exitOnStop = true;
  //  Ward DeBacker
  // begin change for --inspect & --debug debugging (in addition to added debugPort & inspectPort above in this.worker)

  var self = this;
  process.execArgv.forEach(function (option, index) {
    if (option.indexOf('--inspect') !== -1) {
      var pieces = option.split('=');
      if (pieces[1]) {
        self.worker.inspectPort = parseInt(pieces[1]);
      }
      else {
        self.worker.inspectPort = 9229;
      }
    }
    if (option.indexOf('--debug') !== -1) {
      var pieces = option.split('=');
      if (pieces[1]) {
        self.worker.debugPort = parseInt(pieces[1]);
      }
      else {
        self.worker.debugPort = 5858;
      }
    }
  });
  // end change for --inspect & --debug debugging

  this.master = {};
  this.queue = [];
  this.responseHandler = {};
  this.eventId = 0; // for unique event identification (eg for stats)
  this.eventHash = {}; // ditto
  events.EventEmitter.call(this);

  this.on('workerStarted', function(pid, customQueue) {
    if (this.log) console.log('new worker ' + pid + ' started and ready so process queue again');
    if (customQueue || this.queue.length > 0) this.processQueue(customQueue);
  });

  this.started = false;
  this.startTime = new Date().getTime();
};


// Now define all the master process instance methods

var proto = qoper8.prototype;

proto.__proto__ = events.EventEmitter.prototype;

proto.version = require('./master/proto/version');
proto.upTime = require('./master/proto/upTime');
proto.getWorkerPids = require('./master/proto/getWorkerPids');
proto.getStats = require('./master/proto/getStats');
proto.start = require('./master/proto/start');
proto.stop = require('./master/proto/stop');
proto.startWorker = require('./master/proto/startWorker');
proto.stopWorker = require('./master/proto/stopWorker');
proto.getWorkerStats = require('./master/proto/getWorkerStats');
proto.getAllWorkerStats = require('./master/proto/getAllWorkerStats');
proto.getWorkerAvailability = require('./master/proto/getWorkerAvailability');
proto.addToQueue = require('./master/proto/addToQueue');
proto.processQueue = require('./master/proto/processQueue');
proto.getWorker = require('./master/proto/getWorker');
proto.sendRequestToWorker = require('./master/proto/sendRequestToWorker');
proto.toggleLogging = require('./master/proto/toggleLogging');
proto.setWorkerPoolSize = require('./master/proto/setWorkerPoolSize');
proto.setWorkerIdleLimit = require('./master/proto/setWorkerIdleLimit');
proto.handleMessage = require('./master/proto/handleMessage');
proto.handleStats = require('./master/proto/handleStats');

// =================================================
//
// worker process code
//

var workerProcess = function(params) {
  this.moduleName = 'ewd-qoper8 Worker Process';
  this.build = build;
  this.isFirst = false;
  this.environment = {};
  this.count = 0;
  events.EventEmitter.call(this);
};

proto = workerProcess.prototype;
proto.__proto__ = events.EventEmitter.prototype;
proto.version = require('./master/proto/version');
proto.init = require('./worker/proto/init');
proto.upTime = require('./master/proto/upTime');
proto.getStats = require('./worker/proto/getStats');
proto.returnMessage = require('./worker/proto/returnMessage');
proto.sendMessage = require('./worker/proto/sendMessage');
proto.hasFinished = require('./worker/proto/hasFinished');
proto.hasStarted = require('./worker/proto/hasStarted');
proto.exit = require('./worker/proto/exit');

// Module.exports

module.exports = {
  masterProcess: qoper8,
  workerProcess: workerProcess
};


