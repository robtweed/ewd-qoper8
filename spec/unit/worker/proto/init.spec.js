var mockery = require('mockery');
var events = require('events');
var rewire = require('rewire');
var init = rewire('../../../../lib/worker/proto/init');

describe('unit/worker/proto/init:', function () {
  var WorkerProcess;
  var workerProcess;
  var removeLastListener;
  var originalArgv;

  beforeAll(function () {
    removeLastListener = function (target, eventName) {
      var fn = process.listeners(eventName).pop();
      process.removeListener(eventName, fn);
    };

    WorkerProcess = function () {
      this.hasFinished = jasmine.createSpy();
      this.init = init;

      events.EventEmitter.call(this);
    };

    WorkerProcess.prototype = Object.create(events.EventEmitter.prototype);
    WorkerProcess.prototype.constructor = WorkerProcess;

    mockery.enable();
  });

  afterAll(function () {
    mockery.disable();
  });

  beforeEach(function () {
    originalArgv = process.argv;
    process.argv = [];

    jasmine.clock().install();

    spyOn(process, 'on').and.callThrough();

    workerProcess = new WorkerProcess();
  });

  afterEach(function () {
    workerProcess.removeAllListeners();
    workerProcess = null;

    removeLastListener(process, 'message');
    removeLastListener(process, 'SIGINT');
    removeLastListener(process, 'SIGTERM');
    removeLastListener(process, 'uncaughtException');

    jasmine.clock().uninstall();
    process.argv = originalArgv;

    mockery.deregisterAll();
  });

  describe('workerListeners', function () {
    describe('workerModule', function () {
      it('should init worker process message handler', function () {
        // ARRANGE
        var workerModule = jasmine.createSpy();
        mockery.registerMock('foo', workerModule);

        process.argv = ['node', 'test.js', 'foo'];

        // ACT
        workerProcess.init();

        // ASSERT
        expect(workerModule).toHaveBeenCalledWithContext(workerProcess);
      });
    });

    describe('workerSubModule', function () {
      it('should init worker process message handler', function () {
        // ARRANGE
        var workerModule = jasmine.createSpyObj(['bar']);
        mockery.registerMock('foo', workerModule);

        process.argv = ['node', 'test.js', 'foo.bar'];

        // ACT
        workerProcess.init();

        // ASSERT
        expect(workerModule.bar).toHaveBeenCalledWithContext(workerProcess);
      });
    });
  });

  describe('props', function () {
    it('should set startTime', function () {
      // ARRANGE
      var nowUtc = new Date(Date.UTC(2017, 0, 1));
      jasmine.clock().mockDate(nowUtc);

      // ACT
      workerProcess.init();

      // ASSERT
      expect(workerProcess.startTime).toBe(1483228800000);
    });

    it('should set suppressLog', function () {
      // ACT
      workerProcess.init();

      // ASSERT
      expect(workerProcess.suppressLog).toEqual({
        'qoper8-getStats': true
      });
    });
  });

  describe('#dontLog', function () {
    it('should define dontLog', function () {
      // ACT
      workerProcess.init();

      // ASSERT
      expect(workerProcess.dontLog).toEqual(jasmine.any(Function));
    });

    describe('When dontLog called', function () {
      it('should populate suppressLog', function () {
        // ARRANGE
        var types = ['foo', 'bar'];

        // ACT
        workerProcess.init();
        workerProcess.dontLog(types);

        // ASSERT
        expect(workerProcess.suppressLog).toEqual({
          'qoper8-getStats': true,
          foo: true,
          bar: true
        });
      });
    });
  });

  describe('unknownMessage', function () {
    it('should add event handler', function () {
      // ARRANGE
      spyOn(workerProcess, 'on');

      // ACT
      workerProcess.init();

      // ASSERT
      expect(workerProcess.on.calls.count()).toBe(1);
      expect(workerProcess.on.calls.argsFor(0)).toEqual(['unknownMessage', jasmine.any(Function)]);
    });

    describe('When unknownMessage emitted', function () {
      it('should call finished callback with error', function () {
        // ARRANGE
        var messageObj = {
          type: 'foo'
        };
        var sendCallback = jasmine.createSpy();
        var finishedCallback = jasmine.createSpy();

        // ACT
        workerProcess.init();
        workerProcess.emit('unknownMessage', messageObj, sendCallback, finishedCallback);

        // ASSERT
        expect(finishedCallback).toHaveBeenCalledWith({
          error: 'No handler found for foo message'
        });
      });
    });
  });

  describe('message', function () {
    it('should add event handler', function () {
      // ACT
      workerProcess.init();

      // ASSERT
      expect(process.on.calls.count()).toBe(4);
      expect(process.on.calls.argsFor(0)).toEqual(['message', jasmine.any(Function)]);
    });

    describe('When message emitted', function () {
      it('should call #messageHandler', function () {
        // ARRANGE
        var messageObj = {};
        var callback = jasmine.createSpy();
        var revert = init.__set__('messageHandler', callback);

        // ACT
        workerProcess.init();
        process.emit('message', messageObj);

        // ASSERT
        expect(callback).toHaveBeenCalledWithContext(workerProcess, messageObj);

        revert();
      });
    });
  });

  describe('SIGINT', function () {
    it('should add event handler', function () {
      // ACT
      workerProcess.init();

      // ASSERT
      expect(process.on.calls.count()).toBe(4);
      expect(process.on.calls.argsFor(1)).toEqual(['SIGINT', jasmine.any(Function)]);
    });

    describe('When SIGINT emitted', function () {
      it('should produce correct message to log output', function () {
        // ARRANGE
        spyOn(console, 'log');

        // ACT
        workerProcess.init();
        var fn = process.listeners('SIGINT').pop();
        process.on('SIGINT', jasmine.createSpy());

        fn();

        // ASSERT
        expect(console.log.calls.count()).toBe(1);
        expect(console.log.calls.argsFor(0)).toEqual([
          jasmine.stringMatching(/Child Process \d{4,5} detected SIGINT \(Ctrl\-C\) \- ignored/)
        ]);
      });
    });
  });

  describe('SIGTERM', function () {
    it('should add event handler', function () {
      // ACT
      workerProcess.init();

      // ASSERT
      expect(process.on.calls.count()).toBe(4);
      expect(process.on.calls.argsFor(2)).toEqual(['SIGTERM', jasmine.any(Function)]);
    });

    describe('When SIGTERM emitted', function () {
      it('should produce correct message to log output', function () {
        // ARRANGE
        spyOn(console, 'log');

        // ACT
        workerProcess.init();
        var fn = process.listeners('SIGTERM').pop();
        process.on('SIGTERM', jasmine.createSpy());

        fn();

        // ASSERT
        expect(console.log.calls.count()).toBe(1);
        expect(console.log.calls.argsFor(0)).toEqual([
          jasmine.stringMatching(/Child Process \d{4,5} detected SIGTERM signal \- ignored/)
        ]);
      });
    });
  });

  describe('uncaughtException', function () {
    it('should add event handler', function () {
      // ACT
      workerProcess.init();

      // ASSERT
      expect(process.on.calls.count()).toBe(4);
      expect(process.on.calls.argsFor(3)).toEqual(['uncaughtException', jasmine.any(Function)]);
    });

    describe('When uncaughtException emitted', function () {
      var err;

      beforeEach(function () {
        err = {
          stack: 'stack',
          message: 'error message'
        };

        spyOn(process, 'exit');
      });

      it('should emit unexpectedError event handlers', function () {
        // ARRANGE
        var callback = jasmine.createSpy();
        workerProcess.on('unexpectedError', callback);

        // ACT
        workerProcess.init();
        var fn = process.listeners('uncaughtException').pop();
        process.on('uncaughtException', jasmine.createSpy());

        fn(err);

        // ASSERT
        expect(callback).toHaveBeenCalled();
      });

      it('should call #hasFinished', function () {
        // ACT
        workerProcess.init();
        var fn = process.listeners('uncaughtException').pop();
        process.on('uncaughtException', jasmine.createSpy());

        fn(err);

        // ASSERT
        expect(workerProcess.hasFinished).toHaveBeenCalledWith('error', 'error message');
      });

      describe('When userDefined.config.errorLogFile', function () {
        beforeEach(function () {
          workerProcess.userDefined = {
            config: {
              errorLogFile: '/path/to/errorLogFile'
            }
          };
        });

        it('should append error message to error log file', function () {
          // ARRANGE
          var callback = jasmine.createSpy();
          var revert = init.__set__('fs', {
            appendFileSync: callback
          });

          // ACT
          workerProcess.init();
          var fn = process.listeners('uncaughtException').pop();
          process.on('uncaughtException', jasmine.createSpy());

          fn(err);

          // ASSERT
          expect(callback).toHaveBeenCalledWith('/path/to/errorLogFile', jasmine.any(String));

          revert();
        });
      });
    });
  });
});
