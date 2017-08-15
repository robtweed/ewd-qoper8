var events = require('events');
var messageHandler = require('../../../../lib/worker/proto/messageHandler');

describe(' - unit/worker/proto/messageHandler:', function () {
  var WorkerProcess;
  var workerProcess;

  beforeAll(function () {
    WorkerProcess = function () {
      this.log = true;
      this.suppressLog = {};
      this.count = 0;
      this.exit = jasmine.createSpy();
      this.getStats = jasmine.createSpy();
      this.hasStarted = jasmine.createSpy();
      this.hasFinished = jasmine.createSpy();
      this.returnMessage = jasmine.createSpy();
      this.messageHandler = messageHandler;

      events.EventEmitter.call(this);
    };

    WorkerProcess.prototype = Object.create(events.EventEmitter.prototype);
    WorkerProcess.prototype.constructor = WorkerProcess;
  });

  beforeEach(function () {
    process.send = jasmine.createSpy();
    workerProcess = new WorkerProcess();
  });

  afterEach(function () {
    workerProcess.removeAllListeners();
    workerProcess = null;

    delete process.send;
  });

  it('should increase count', function () {
    // ARRANGE
    var expected = 1;
    var messageObj = {
      type: 'foo'
    };

    // ACT
    workerProcess.messageHandler(messageObj);

    // ASSERT
    expect(workerProcess.count).toBe(expected);
  });

  it('should emit `message` event', function () {
    // ARRANGE
    var messageObj = {
      type: 'foo'
    };

    spyOn(workerProcess, 'emit');

    // ACT
    workerProcess.messageHandler(messageObj);

    // ASSERT
    expect(workerProcess.emit).toHaveBeenCalledWith('message', messageObj, jasmine.any(Function), jasmine.any(Function));
  });

  describe('When no handler found', function () {
    it('should call #hasFinished with error', function () {
      // ARRANGE
      var messageObj = {
        type: 'foo'
      };

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.hasFinished).toHaveBeenCalledWith('foo', {
        error: 'No handler found for foo message'
      });
    });
  });

  describe('qoper8-start', function () {
    var messageObj;

    beforeEach(function () {
      messageObj = {
        type: 'qoper8-start',
        log: true,
        build: {
          no: 'x.x.x',
          date: '1 January 1970'
        },
        userDefined: {
          foo: 'bar'
        },
        isFirst: false
      };
    });

    it('should set worker props', function () {
      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.log).toBeTruthy();
      expect(workerProcess.build).toEqual({
        no: 'x.x.x',
        date: '1 January 1970'
      });
      expect(workerProcess.userDefined).toEqual({
        foo: 'bar'
      });
    });

    it('should call #hasStarted', function () {
      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.hasStarted).toHaveBeenCalled();
    });

    it('should emit `start` event', function () {
      // ARRANGE
      spyOn(workerProcess, 'emit');

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.emit).toHaveBeenCalledWith('start', false);
    });

    it('should NOT emit `message` event', function () {
      // ARRANGE
      spyOn(workerProcess, 'emit');

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.emit).not.toHaveBeenCalledWith('message', messageObj, jasmine.any(Function), jasmine.any(Function));
    });
  });

  describe('qoper8-getStats', function () {
    var messageObj;

    beforeEach(function () {
      messageObj = {
        type: 'qoper8-getStats',
        id: 10200
      };
    });

    it('should call #getStats', function () {
      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.getStats).toHaveBeenCalled();
    });

    it('should call process.send', function () {
      // ARRANGE
      workerProcess.getStats.and.returnValue({
        foo: 'bar'
      });

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(process.send).toHaveBeenCalledWith({
        type: 'qoper8-stats',
        stats: {
          foo: 'bar'
        },
        id: 10200,
        dontLog: true
      });
    });

    it('should NOT emit `message` event', function () {
      // ARRANGE
      spyOn(workerProcess, 'emit');

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.emit).not.toHaveBeenCalledWith('message', messageObj, jasmine.any(Function), jasmine.any(Function));
    });
  });

  describe('qoper8-exit', function () {
    var messageObj;

    beforeEach(function () {
      messageObj = {
        type: 'qoper8-exit'
      };
    });

    it('should call #exit', function () {
      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.exit).toHaveBeenCalled();
    });

    it('should emit `stop` event', function () {
      // ARRANGE
      spyOn(workerProcess, 'emit');

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.emit).toHaveBeenCalledWith('stop');
    });

    it('should NOT emit `message` event', function () {
      // ARRANGE
      spyOn(workerProcess, 'emit');

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.emit).not.toHaveBeenCalledWith('message', messageObj, jasmine.any(Function), jasmine.any(Function));
    });
  });

  describe('qoper8-test', function () {
    var messageObj;

    beforeEach(function () {
      messageObj = {
        type: 'qoper8-test',
        messageNo: 10,
        contents: 'contents'
      };
    });

    it('should call #hasFinished', function () {
      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.hasFinished).toHaveBeenCalledWith('qoper8-test', {
        responseNo: 10,
        contents: 'contents',
        count: 1
      });
    });

    it('should NOT emit `message` event', function () {
      // ARRANGE
      spyOn(workerProcess, 'emit');

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.emit).not.toHaveBeenCalledWith('message', messageObj, jasmine.any(Function), jasmine.any(Function));
    });
  });

  describe('send', function () {
    it('should call #returnMessage with results.type', function () {
      // ARRANGE
      var messageObj = {
        type: 'foo'
      };

      workerProcess.on('message', function (messageObj, send) {
        send({
          type: 'bar',
          value: 'baz'
        });
      });

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.returnMessage).toHaveBeenCalledWith('bar', {
        value: 'baz'
      });
    });

    it('should call #returnMessage with messageObj.type', function () {
      // ARRANGE
      var messageObj = {
        type: 'foo'
      };

      workerProcess.on('message', function (messageObj, send) {
        send({
          value: 'baz'
        });
      });

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.returnMessage).toHaveBeenCalledWith('foo', {
        value: 'baz'
      });
    });
  });

  describe('finished', function () {
    it('should call #hasFinished', function () {
      // ARRANGE
      var messageObj = {
        type: 'foo'
      };

      workerProcess.on('message', function (messageObj, send, finished) {
        finished({
          value: 'baz'
        });
      });

      // ACT
      workerProcess.messageHandler(messageObj);

      // ASSERT
      expect(workerProcess.hasFinished).toHaveBeenCalledWith('foo', {
        value: 'baz'
      });
    });

    describe('When worker.sessionLocked', function () {
      beforeEach(function () {
        workerProcess.sessionLocked = true;
      });

      describe('and worker.db', function () {
        beforeEach(function () {
          workerProcess.db = {
            unlock: jasmine.createSpy()
          };
        });

        it('should call #worker.db.unlock', function () {
          // ARRANGE
          var messageObj = {
            type: 'foo'
          };

          workerProcess.on('message', function (messageObj, send, finished) {
            finished({
              value: 'baz'
            });
          });

          // ACT
          workerProcess.messageHandler(messageObj);

          // ASSERT
          expect(workerProcess.db.unlock).toHaveBeenCalledWith(true);
        });
      });
    });
  });
});
