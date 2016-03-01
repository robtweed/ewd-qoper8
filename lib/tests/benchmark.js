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

var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();

var test = {
  poolSize: parseInt(process.argv[2]) || 1,
  max: parseInt(process.argv[3]) || 100000,
  noPerBlock: parseInt(process.argv[4])|| 500,
  waitPerBlock: parseInt(process.argv[5]) || 51,  // increase if queue keeps expanding, decrease if queue exhausted too often
  messageType: 'qoper8-test',
  messageContents:  {
    hello: 'world',
    a: 12345
  },
  log: false
};

console.log(JSON.stringify(test, null, 2));

function addMessages(no, wait) {
  // add a block of messages to the queue
  var test = this.test;
  if (test.log) console.log('add a block of messages to queue');
  test.batchNo++;
  var q = this;
  setTimeout(function() {
    // Check what's already in the queue
    if (q.queue.length > test.maxQueueLength) {
      console.log('Block no: ' + test.batchNo + ' (' + test.msgNo + '): queue length increased to ' + q.queue.length);
      test.maxQueueLength = q.queue.length;
    }
    if (q.queue.length === 0) console.log('Block no: ' + test.batchNo + ' (' + test.msgNo + '): Queue exhausted');
    // Now add another block
    for (var i = 0; i < no; i++) {
      test.msgNo++;
      var messageObj = {
        type: test.messageType,
        messageNo: test.msgNo,
        time: new Date().getTime(),
        contents: test.messageContents
      };
      q.addToQueue(messageObj);
    }
    // add another block of message to the queue
    if (test.msgNo < test.max) addMessages.call(q, no, wait);  
  }, wait);
};


q.on('start', function() {
  this.log = false;
  this.setWorkerPoolSize(test.poolSize);
  test.msgNo = 0;
  test.batchNo = 0;
  test.maxQueueLength = 0;
  this.test = test;
});


q.on('response', function(responseObj, pid) {
  //console.log('response: ' + JSON.stringify(responseObj));
  if (responseObj.message.responseNo) {
    var responseNo = responseObj.message.responseNo;
    if (parseInt(responseNo) === this.test.max) {
      var elapsed = (new Date().getTime() - this.test.startTime) / 1000;
      var rate = this.test.max / elapsed;
      console.log(responseNo + ' messages: ' + elapsed + ' sec');
      console.log('Processing rate: ' + rate + ' message/sec');
      for (var pid in this.worker.process) {
        console.log('Worker ' + pid + ': ' + this.worker.process[pid].totalRequests + ' requests handled');
      }
      console.log('');
      console.log('===========================');
      q.stop();
    }
  }
});

q.on('started', function() {
  console.log('ewd-qoper8 test:');
  console.log('No of workers: ' + this.worker.poolSize);
  console.log('Total messages: ' + this.test.max);
  console.log('Messages added to queue per block: ' + test.noPerBlock);
  console.log('Delay (ms) between adding each block: ' + test.waitPerBlock);
  console.log('Test harness logging: ' + test.log);
  console.log('ewd-qoper8 logging: ' + this.log);
  console.log('Starting test...');
  this.test.startTime = new Date().getTime();

  addMessages.call(this, test.noPerBlock, test.waitPerBlock);
});

q.start();


