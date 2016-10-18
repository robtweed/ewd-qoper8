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

  18 October 2016

*/

function messageHandler(messageObj) {
  if (this.log) console.log('worker ' + process.pid + ' received message: ' + JSON.stringify(messageObj));
  this.count++;
  var type = messageObj.type;

  if (type === 'qoper8-start') {
    this.log = messageObj.log;
    this.build = messageObj.build;
    if (messageObj.userDefined) this.userDefined = messageObj.userDefined;
    this.emit('start', messageObj.isFirst);
    this.hasStarted();
    return;
  }

  if (type === 'qoper8-getStats') {
    process.send({
      type: 'qoper8-stats',
      stats: this.getStats(),
      id: messageObj.id
    });
    return;
  }

  if (type === 'qoper8-exit') {

    // run any custom shutdown logic
    this.emit('stop');
    this.exit();
    return;
  }

  if (type === 'qoper8-test') {
    // handle test message
    if (this.log) console.log(type + ' message received by worker ' + process.pid + ': ' + JSON.stringify(messageObj));
    var responseObj = {
      responseNo: messageObj.messageNo,
      contents: messageObj.contents,
      count: this.count
    };
    this.hasFinished(type, responseObj);
    responseObj = null;
    return;
  }

  // handle any other incoming message using custom handler

  var worker = this;

  function send(results) {
    if (results.type) {
      var type = results.type;
      delete results.type;
      worker.returnMessage(type, results);
    }
    else {
      worker.returnMessage(messageObj.type, results);
    }
  }

  function finished(results) {
    if (worker.sessionLocked && worker.db) {
      var ok = worker.db.unlock(worker.sessionLocked);
    }
    worker.hasFinished(messageObj.type, results);
  }

  var ok = this.emit('message', messageObj, send, finished);
  if (!ok) {
    var results = {
      error: 'No handler found for ' + type + ' message'
    };
    this.hasFinished(type, results);
  }
}

module.exports = messageHandler;
