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

module.exports = function() {

  var handleExpressMessage = require('ewd-qoper8-express').workerMessage;

  this.on('expressMessage', function(messageObj, send, finished) {
    var results = {
      youSent: messageObj,
      workerSent: 'hello from worker ' + process.pid,
      time: new Date().toString()
    };
    finished(results);
  });

  this.on('message', function(messageObj, send, finished) {
    var expressMessage = handleExpressMessage.call(this, messageObj, send, finished);
    if (expressMessage) return;

    // handle any non-Express messages
    if (messageObj.type === 'non-express-message') {
      var results = {
        messageType: 'non-express',
        workerSent: 'hello from worker ' + process.pid,
        time: new Date().toString()
      };
      finished(results);
    }
    else {
      this.emit('unknownMessage', messageObj, send, finished);
    }
  });
  
};
