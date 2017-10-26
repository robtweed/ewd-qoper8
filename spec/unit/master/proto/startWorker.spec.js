var cp = require('child_process');
var events = require('events');
var startWorker = require('../../../../lib/master/proto/startWorker');

describe('unit/master/proto/startWorker:', function () {
  var WorkerProcess;
  var MasterProcess;
  var workerProcess1;
  var workerProcess2;
  var masterProcess;

  beforeAll(function () {
    WorkerProcess = function (pid) {
      this.pid = pid;
      this.send = jasmine.createSpy();

      events.EventEmitter.call(this);
    };

    WorkerProcess.prototype = Object.create(events.EventEmitter.prototype);
    WorkerProcess.prototype.constructor = WorkerProcess;

    MasterProcess = function () {
      this.worker = {
        loaderFilePath: '/path/to/loader',
        module: '/path/to/module',
        list: [],
        process: {},
        inspectPort: 9229,
        debugPort: 5858
      };
      this.queue = [];
      this.emit = jasmine.createSpy();
      this.processQueue = jasmine.createSpy();
      this.startWorker = startWorker;
    };
  });

  beforeEach(function () {
    jasmine.clock().install();

    workerProcess1 = new WorkerProcess(10100);
    workerProcess2 = new WorkerProcess(10200);

    masterProcess = new MasterProcess();
    masterProcess.worker.list = [workerProcess2.pid];
    masterProcess.worker.process[workerProcess2.pid] = workerProcess2;

    spyOn(cp, 'fork').and.returnValue(workerProcess1);
  });

  afterEach(function () {
    jasmine.clock().uninstall();

    workerProcess1.removeAllListeners();

    masterProcess = null;
    workerProcess1 = null;
  });

  it('should spawn a new worker process', function () {
    // ACT
    masterProcess.startWorker();

    // ASSERT
    expect(cp.fork).toHaveBeenCalledWith(
      '/path/to/loader',
      [
        '/path/to/module'
      ],
      {
        execArgv: [],
        env: process.env
      }
    );
  });

  describe('execArgv', function () {
    it('--inspect', function () {
      // ARRANGE
      process.execArgv = ['--inspect=9229'];

      // ACT
      masterProcess.startWorker();

      // ASSERT
      expect(cp.fork.calls.first().args[2].execArgv).toEqual(['--inspect=9230']);
    });

    it('--debug && --debug-brk', function () {
      // ARRANGE
      process.execArgv = ['--debug=5858', '--debug-brk'];

      // ACT
      masterProcess.startWorker();

      // ASSERT
      expect(cp.fork.calls.first().args[2].execArgv).toEqual(['--debug=5859', '--debug-brk']);
    });
  });

  describe('message', function () {
    it('should add event handler', function () {
      // ARRANGE
      spyOn(workerProcess1, 'on');

      // ACT
      masterProcess.startWorker();

      // ASSERT
      expect(workerProcess1.on.calls.count()).toBe(2);
      expect(workerProcess1.on.calls.argsFor(0)).toEqual(['message', jasmine.any(Function)]);
    });

    describe('When message emitted', function () {
      beforeEach(function () {
        var nowUtc = new Date(Date.UTC(2017, 0, 1));
        jasmine.clock().mockDate(nowUtc);
      });

      describe('and log enabled', function () {
        beforeEach(function () {
          masterProcess.log = true;
        });

        describe('and responseObj.dontLog is NOT set', function () {
          it('should produce correct message to log output', function () {
            // ARRANGE
            var responseObj = {};
            masterProcess.startWorker();
            masterProcess.worker.process = {};

            spyOn(console, 'log');

            // ACT
            workerProcess1.emit('message', responseObj);

            // ASSERT
            expect(console.log).toHaveBeenCalledWith(
              'Sun, 01 Jan 2017 00:00:00 GMT; master process received response from worker 10100: {}');
          });
        });
      });

      describe('and worker NOT found', function () {
        it('should NOT emit `response` event', function () {
          // ARRANGE
          var responseObj = {};
          masterProcess.startWorker();
          masterProcess.worker.process = {};

          // ACT
          workerProcess1.emit('message', responseObj);

          // ASSERT
          expect(masterProcess.emit).not.toHaveBeenCalledWith('response', responseObj, 10100);
        });
      });

      describe('and responseObj.type is `workerProcess1Started`', function () {
        it('should emit `workerStarted` event', function () {
          // ARRANGE
          var customQueue = false;
          var responseObj = {
            type: 'workerProcessStarted'
          };

          masterProcess.startWorker(customQueue);

          // ACT
          workerProcess1.emit('message', responseObj);

          // ASSERT
          expect(masterProcess.emit).toHaveBeenCalledWith('workerStarted', 10100, false);
          expect(masterProcess.emit).not.toHaveBeenCalledWith('response', responseObj, 10100);
        });

        it('should NOT emit `response` event', function () {
          // ARRANGE
          var customQueue = false;
          var responseObj = {
            type: 'workerProcessStarted'
          };

          masterProcess.startWorker(customQueue);

          // ACT
          workerProcess1.emit('message', responseObj);

          // ASSERT
          expect(masterProcess.emit).not.toHaveBeenCalledWith('response', responseObj, 10100);
        });

        it('should update worker process props', function () {
          // ARRANGE
          var customQueue = false;
          var responseObj = {
            type: 'workerProcessStarted'
          };

          masterProcess.startWorker(customQueue);

          // ACT
          workerProcess1.emit('message', responseObj);

          // ASSERT
          expect(workerProcess1.isAvailable).toBeTruthy();
          expect(workerProcess1.time).toBe(1483228800000);
          expect(workerProcess1.totalRequests).toBe(0);
        });
      });

      describe('and NOT customQueue', function () {
        describe('and responseObj.finished', function () {
          it('should update worker process props', function () {
            // ARRANGE
            var customQueue = false;
            var responseObj = {
              type: 'foo',
              finished: true
            };

            masterProcess.startWorker(customQueue);

            // ACT
            workerProcess1.emit('message', responseObj);

            // ASSERT
            expect(workerProcess1.isAvailable).toBeTruthy();
            expect(workerProcess1.time).toBe(1483228800000);
          });

          describe('and queue is not empty', function () {
            it('should call #processQueue', function () {
              // ARRANGE
              var customQueue = false;
              var responseObj = {
                type: 'foo',
                finished: true
              };

              masterProcess.startWorker(customQueue);
              masterProcess.queue = [
                {
                  type: 'baz'
                }
              ];

              // ACT
              workerProcess1.emit('message', responseObj);

              // ASSERT
              expect(masterProcess.processQueue).toHaveBeenCalledWith(false);
            });
          });
        });
      });
    });
  });

  describe('exit', function () {
    it('should add event handler', function () {
      // ARRANGE
      spyOn(workerProcess1, 'on');

      // ACT
      masterProcess.startWorker();

      // ASSERT
      expect(workerProcess1.on.calls.count()).toBe(2);
      expect(workerProcess1.on.calls.argsFor(1)).toEqual(['exit', jasmine.any(Function)]);
    });

    describe('When exit emitted', function () {
      it('should delete worker process', function () {
        // ARRANGE
        masterProcess.startWorker();
        expect(masterProcess.worker.process[10100]).toBe(workerProcess1);

        // ACT
        workerProcess1.emit('exit');

        // ASSERT
        expect(masterProcess.worker.process[10100]).toBeUndefined();
      });

      it('should rebuild array of current worker process pids', function () {
        // ARRANGE
        masterProcess.startWorker();
        expect(masterProcess.worker.list).toEqual(['10100', '10200']);

        // ACT
        workerProcess1.emit('exit');

        // ASSERT
        expect(masterProcess.worker.list).toEqual(['10200']);
      });
    });
  });
});
