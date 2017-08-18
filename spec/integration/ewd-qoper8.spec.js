'use strict';

var qoper8 = require('../../');
var loaderFile = require('./fixtures/loaderFile');

describe(' - integration/ewd-qoper8: ', function () {
  var q;
  var stopTimeout = 2000;

  beforeEach(function () {
    q = new qoper8.masterProcess();

    q.on('start', function () {
      this.exitOnStop = false;
      this.worker.loaderText = loaderFile;
      this.checkWorkerPoolDelay = 1000;
    });

    q.on('started', function() {
      console.log(q.version() + ' running in process ' + process.pid);
    });
  });

  afterEach(function () {
    q.removeAllListeners();
    q = null;
  });

  it('Getting Started With ewd-qoper8', function (done) {
    q.on('stop', done);

    q.start();

    setTimeout(function() {
     q.stop();
    }, stopTimeout);
  });

  it('Testing Adding a Message to the ewd-qoper8 Queue', function (done) {
    q.on('started', function() {
      var messageObj = {
        type: 'testMessage',
        hello: 'world'
      };

      this.addToQueue(messageObj);
    });

    q.on('response', function (responseObj) {
      expect(responseObj).toEqual({
        type: 'testMessage',
        finished: true,
        message: {
          error: 'No handler found for testMessage message'
        }
      });
    });

    q.on('stop', done);

    q.start();

    setTimeout(function() {
     q.stop();
    }, stopTimeout);
  });

  it('Handling Multiple Messages', function (done) {
    var responseObjs = [];

    q.on('started', function() {
      var messageObj1 = {
        type: 'testMessage1',
        hello: 'world'
      };

      this.addToQueue(messageObj1);

      var messageObj2 = {
        type: 'testMessage2',
        hello: 'rob'
      };

      this.addToQueue(messageObj2);
    });

    q.on('response', function (responseObj) {
      responseObjs.push(responseObj);
    });

    q.on('stop', function () {
      expect(responseObjs.length).toBe(2);
      expect(responseObjs[0]).toEqual({
        type: 'testMessage1',
        finished: true,
        message: {
          error: 'No handler found for testMessage1 message'
        }
      });
      expect(responseObjs[1]).toEqual({
        type: 'testMessage2',
        finished: true,
        message: {
          error: 'No handler found for testMessage2 message'
        }
      });

      done();
    });

    q.start();

    setTimeout(function() {
     q.stop();
    }, stopTimeout);
  });

  it('Defining The Worker Process Pool Size', function (done) {
    q.on('start', function () {
      this.setWorkerPoolSize(2);
    });

    q.on('started', function () {
      var noOfMessages = 5;
      var messageObj;

      for (var i = 0; i < noOfMessages; i++) {
        messageObj = {
          type: 'testMessage' + i,
          hello: 'world'
        };
        this.addToQueue(messageObj);
      }
    });

    q.on('stop', done);

    q.start();

    setTimeout(function() {
      q.handleStats(function (stats) {
        expect(stats.master).toBeDefined();
        expect(stats.master.workerProcesses.length).toBe(2);
        expect(stats.worker).toBeDefined();
        expect(stats.worker.length).toBe(2);
        q.stop();
      });
    }, stopTimeout);
  });

  it('Configuring ewd-qoper8 To Use Your Worker Handler Module and Handling the Results Object Returned from the Worker', function (done) {
    q.on('start', function () {
      this.setWorkerPoolSize(2);
      this.worker.module = process.cwd() + '/spec/integration/fixtures/workerModule1';
    });

    q.on('started', function() {
      var noOfMessages = 5;
      var messageObj;

      for (var i = 0; i < noOfMessages; i++) {
        messageObj = {
          type: 'testMessage' + i,
          hello: 'world'
        };
        this.addToQueue(messageObj);
      }
    });

    q.on('response', function (responseObj) {
      expect(responseObj.type).toMatch(/testMessage\d{1}/);
      expect(responseObj.message).toEqual({
        hello: 'world'
      });
    });

    q.on('stop', done);

    q.start();

    setTimeout(function() {
      q.getWorkerAvailability(function(available) {
        q.worker.list.forEach(function (pid) {
          expect(available[pid]).toBeTruthy();
        });

        q.stop();
      });
    }, stopTimeout);
  });

  it('Simpler Message Handling with the handleMessage Function', function (done) {
    q.on('start', function () {
      this.worker.module = process.cwd() + '/spec/integration/fixtures/workerModule2';
    });

    function callback(response) {
      expect(response.type).toMatch(/testMessage\d{1}/);

      if (response.finished) {
        expect(response.message.time).toEqual(jasmine.any(String));
        expect(response.message.count).toEqual(jasmine.any(Number));
      } else {
        expect(response.message.info).toBe('intermediate message');
        expect(response.message.pid).toEqual(jasmine.any(Number));
      }
    }

    q.on('started', function() {
      var noOfMessages = 5;
      var messageObj;

      for (var i = 0; i < noOfMessages; i++) {
        messageObj = {
          type: 'testMessage' + i,
          hello: 'world'
        };

        this.addToQueue(messageObj);
        this.handleMessage(messageObj, callback);
      }
    });

    q.on('stop', done);

    q.start();

    setTimeout(function() {
      q.stop();
    }, stopTimeout);
  });
});
