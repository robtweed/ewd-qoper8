var events = require('events');
var rewire = require('rewire');
var start = rewire('../../../../lib/master/proto/start');

describe('unit/master/proto/start:', function () {
  var MasterProcess;
  var WorkerProcess;
  var masterProcess;
  var removeLastListener;
  var checkWorkerPool;
  var createWorkerProcessModule;

  var revert = function (obj) {
    obj.__revert__();
    delete obj.__revert__;
  };

  beforeAll(function () {
    removeLastListener = function (target, eventName) {
      var fn = process.listeners(eventName).pop();
      process.removeListener(eventName, fn);
    };

    WorkerProcess = function (isAvailable) {
      this.isAvailable = isAvailable;
    };

    MasterProcess = function () {
      this.worker = {
        list: [10100, 10200],
        poolSize: 2,
        process: {
          10100: new WorkerProcess(true),
          10200: new WorkerProcess(false)
        }
      };
      this.responseHandler = {};
      this.eventHash = {};
      this.stop = jasmine.createSpy();
      this.start = start;

      events.EventEmitter.call(this);
    };

    MasterProcess.prototype = Object.create(events.EventEmitter.prototype);
    MasterProcess.prototype.constructor = MasterProcess;
  });

  beforeEach(function () {
    spyOn(process, 'on').and.callThrough();

    checkWorkerPool = jasmine.createSpy();
    checkWorkerPool.__revert__ = start.__set__('checkWorkerPool', checkWorkerPool);

    createWorkerProcessModule = jasmine.createSpy();
    createWorkerProcessModule.__revert__ = start.__set__('createWorkerProcessModule', createWorkerProcessModule);

    masterProcess = new MasterProcess();
  });

  afterEach(function () {
    masterProcess.removeAllListeners();
    masterProcess = null;

    removeLastListener(process, 'SIGINT');
    removeLastListener(process, 'SIGTERM');

    revert(checkWorkerPool);
    revert(createWorkerProcessModule);
  });


  it('should emit start', function () {
    // ARRANGE
    spyOn(masterProcess, 'emit');

    // ACT
    masterProcess.start();

    // ASSERT
    expect(masterProcess.emit).toHaveBeenCalledWith('start');
  });

  it('should call #checkWorkerPool', function () {
    // ACT
    masterProcess.start();

    // ASSERT
    expect(checkWorkerPool).toHaveBeenCalledWithContext(masterProcess);
  });

  it('should call #createWorkerProcessModule', function () {
    // ACT
    masterProcess.start();

    // ASSERT
    expect(createWorkerProcessModule).toHaveBeenCalledWithContext(masterProcess);
  });

  describe('SIGINT', function () {
    it('should add event handler', function () {
      // ACT
      masterProcess.start();

      // ASSERT
      expect(process.on.calls.count()).toBe(2);
      expect(process.on.calls.argsFor(0)).toEqual(['SIGINT', jasmine.any(Function)]);
    });

    describe('When SIGINT emitted', function () {
      it('should call #stop', function () {
        // ACT
        masterProcess.start();
        process.emit('SIGINT');

        // ASSERT
        expect(masterProcess.stop).toHaveBeenCalled();
      });

      describe('and log enabled', function () {
        beforeEach(function () {
          masterProcess.log = true;
        });

        it('should produce correct message to log output', function () {
          // ARRANGE
          spyOn(console, 'log');

          // ACT
          masterProcess.start();
          process.emit('SIGINT');

          // ASSERT
          expect(console.log.calls.count()).toBe(4);
          expect(console.log.calls.argsFor(3)).toEqual(['*** CTRL & C detected: shutting down gracefully...']);
        });
      });
    });
  });

  describe('SIGTERM', function () {
    it('should add event handler', function () {
      // ACT
      masterProcess.start();

      // ASSERT
      expect(process.on.calls.count()).toBe(2);
      expect(process.on.calls.argsFor(1)).toEqual(['SIGTERM', jasmine.any(Function)]);
    });

    describe('When SIGTERM emitted', function () {
      it('should call #stop', function () {
        // ACT
        masterProcess.start();
        process.emit('SIGTERM');

        // ASSERT
        expect(masterProcess.stop).toHaveBeenCalled();
      });

      describe('and log enabled', function () {
        beforeEach(function () {
          masterProcess.log = true;
        });

        it('should produce correct message to log output', function () {
          // ARRANGE
          spyOn(console, 'log');

          // ACT
          masterProcess.start();
          process.emit('SIGTERM');

          // ASSERT
          expect(console.log.calls.count()).toBe(4);
          expect(console.log.calls.argsFor(3)).toEqual([
            jasmine.stringMatching(/\*\*\* Master Process \d{4,5} detected SIGTERM signal\.  Shutting down gracefully\.\.\./)
          ]);
        });
      });
    });
  });

  it('should emit started', function () {
    // ARRANGE
    spyOn(masterProcess, 'emit');

    // ACT
    masterProcess.start();

    // ASSERT
    expect(masterProcess.emit).toHaveBeenCalledWith('started');
  });

  describe('beforeDispatch', function () {
    it('should add event handler', function () {
      // ARRANGE
      spyOn(masterProcess, 'on');

      // ACT
      masterProcess.start();

      // ASSERT
      expect(masterProcess.on.calls.count()).toBe(2);
      expect(masterProcess.on.calls.argsFor(0)).toEqual(['beforeDispatch', jasmine.any(Function)]);
    });

    describe('When beforeDispatch emitted', function () {
      it('should do nothing with responseHandler', function () {
        // ARRANGE
        var requestObj = {
          type: 'foo'
        };
        var pid = 10;

        // ACT
        masterProcess.start();
        masterProcess.emit('beforeDispatch', requestObj, pid);

        // ASSERT
        expect(masterProcess.responseHandler).toEqual({});
      });

      describe('and requestObj contains callback', function () {
        it('should add callback in responseHandler', function () {
          // ARRANGE
          var callback = jasmine.createSpy();
          var requestObj = {
            type: 'foo',
            callback: callback
          };
          var pid = 10;

          // ACT
          masterProcess.start();
          masterProcess.emit('beforeDispatch', requestObj, pid);

          // ASSERT
          expect(masterProcess.responseHandler).toEqual({
            10: callback
          });
        });
      });
    });
  });

  describe('response', function () {
    it('should add event handler', function () {
      // ARRANGE
      spyOn(masterProcess, 'on');

      // ACT
      masterProcess.start();

      // ASSERT
      expect(masterProcess.on.calls.count()).toBe(2);
      expect(masterProcess.on.calls.argsFor(1)).toEqual(['response', jasmine.any(Function)]);
    });

    describe('When response emitted', function () {
      describe('and type is `qoper8-stats` ', function () {
        var responseObj;
        var pid;

        beforeEach(function () {
          responseObj = {
            id: 1,
            type: 'qoper8-stats',
            stats: {
              pid: 10100
            }
          };
          pid = 10100;
        });

        describe('and NOT last worker sent stats', function () {
          it('should keep intermediate stats in eventHash', function () {
            // ARRANGE
            var callback = jasmine.createSpy();

            masterProcess.eventHash[responseObj.id] = {
              count: 0,
              max: 2,
              data: {
                master: {
                  pid: 10000
                },
                worker: []
              },
              callback: callback
            };

            // ACT
            masterProcess.start();
            masterProcess.emit('response', responseObj, pid);

            // ASSERT
            expect(callback).not.toHaveBeenCalled();

            var stats = masterProcess.eventHash[responseObj.id];
            expect(stats).toEqual({
              count: 1,
              max: 2,
              data: {
                master: {
                  pid: 10000
                },
                worker: [
                  {
                    pid: 10100,
                    available: true
                  }
                ]
              },
              callback: callback
            });
          });
        });

        describe('and last worker sent stats', function () {
          it('should call callback and pass all workers stats', function () {
            // ARRANGE
            var callback = jasmine.createSpy();

            masterProcess.eventHash[responseObj.id] = {
              count: 1,
              max: 2,
              data: {
                master: {
                  pid: 10000
                },
                worker: [
                  {
                    pid: 10200,
                    available: false
                  }
                ]
              },
              callback: callback
            };

            // ACT
            masterProcess.start();
            masterProcess.emit('response', responseObj, pid);

            // ASSERT
            expect(masterProcess.eventHash).toEqual({});
            expect(callback).toHaveBeenCalledWith({
              master: {
                pid: 10000
              },
              worker: [
                {
                  pid: 10200,
                  available: false
                },
                {
                  pid: 10100,
                  available: true
                }
              ]
            });
          });
        });
      });

      describe('responseHandler', function () {
        describe('When responseHandler finds callback by pid', function () {
          it('should call callback and pass responseObj', function () {
            // ARRANGE
            var callback = jasmine.createSpy();
            var responseObj = {
              type: 'foo'
            };
            var pid = 10100;

            masterProcess.responseHandler[pid] = callback;

            // ACT
            masterProcess.start();
            masterProcess.emit('response', responseObj, pid);

            // ASSERT
            expect(callback).toHaveBeenCalledWith(responseObj);
            expect(masterProcess.responseHandler[pid]).toBe(callback);
          });

          describe('and responseObj is finished', function () {
            it('should remove callback from responseHandler', function () {
              // ARRANGE
              var callback = jasmine.createSpy();
              var responseObj = {
                type: 'foo',
                finished: true
              };
              var pid = 10100;

              masterProcess.responseHandler[pid] = callback;

              // ACT
              masterProcess.start();
              masterProcess.emit('response', responseObj, pid);

              // ASSERT
              expect(callback).toHaveBeenCalledWith(responseObj);
              expect(masterProcess.responseHandler[pid]).toBeUndefined();
            });
          });
        });
      });
    });
  });
});
