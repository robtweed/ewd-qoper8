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

  27 May 2016

*/

var messageHandler = require('./messageHandler');

function init() {

  var workerListeners;
  if (process.argv[2] && process.argv[2] !== 'undefined') {
    var workerModule = process.argv[2];
    var subModule;
    console.log('process.argv[2] = ' + workerModule);
    if (workerModule.indexOf('.') !== -1) {
      var pieces = workerModule.split('.');
      workerModule = pieces[0];
      subModule = pieces[1];
    }
    console.log('workerModule: ' + workerModule + '; ' + subModule);
    if (subModule) {
      workerListeners = require(workerModule)[subModule];
    }
    else {
      workerListeners = require(workerModule);
    }
    workerListeners.call(this);
  }

  this.on('unknownMessage', function(messageObj, send, finished) {
    var results = {
      error: 'No handler found for ' + messageObj.type + ' message'
    };
    finished(results);
  });

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

  process.on('uncaughtException', function(err) {
    var fs = require('fs');

    if (worker.userDefined && worker.userDefined.config && worker.userDefined.config.errorLogFile) {
      fs.appendFileSync(worker.userDefined.config.errorLogFile, '*** uncaughtException in worker ' + process.pid + ' at ' + (new Date()).toUTCString() + '\n' + err.stack + '\n\n');
    }
    console.error('*** uncaughtException in worker ' + process.pid + ' at ' + (new Date()).toUTCString());
    console.error(err.stack);
    worker.emit('unexpectedError');  // signal to, eg ewd-qoper8-cache and -gtm, and to send error message
    worker.hasFinished('error', err.message);
    console.error('*** worker ' + process.pid + ' is shutting down now ...');
    process.exit();
  });

  this.startTime = new Date().getTime();

};

module.exports = init;
