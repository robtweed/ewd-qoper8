var events = require('events');
var rewire = require('rewire');
var qoper8 = rewire('../../lib/ewd-qoper8');

describe('unit/ewd-qoper:', function () {
  var build;
  var loaderFile;

  var revert = function (obj) {
    obj.__revert__();
    delete obj.__revert__;
  };

  beforeEach(function () {
    build = {
      no: 'x.x.x',
      date: '1 January 1970'
    };
    build.__revert__ = qoper8.__set__('build', build);

    loaderFile = ['loader file'];
    loaderFile.__revert__ = qoper8.__set__('loaderFile', loaderFile);
  });

  afterEach(function () {
    revert(build);
    revert(loaderFile);
  });

  describe('masterProcess', function () {
    var masterProcess = null;

    beforeEach(function () {
      jasmine.clock().install();

      var nowUtc = new Date(Date.UTC(2017, 0, 1));
      jasmine.clock().mockDate(nowUtc);

      masterProcess = new qoper8.masterProcess();
    });

    afterEach(function () {
      jasmine.clock().uninstall();
      masterProcess = null;
    });

    it('should be instance of EventEmitter', function () {
      expect(masterProcess instanceof events.EventEmitter).toBeTruthy();
    });

    describe('initial props', function () {
      it('should have moduleName prop', function () {
        expect(masterProcess.moduleName).toBe('ewd-qoper8');
      });

      it('should have build prop', function () {
        expect(masterProcess.build).toEqual(
          jasmine.objectContaining({
            no: 'x.x.x',
            date: '1 January 1970'
          })
        );
      });

      it('should have log prop', function () {
        expect(masterProcess.log).toBeTruthy();
      });

      it('should have checkWorkerPoolDelay prop', function () {
        expect(masterProcess.checkWorkerPoolDelay).toBe(300000);
      });

      it('should have shutdownDelay prop', function () {
        expect(masterProcess.shutdownDelay).toBe(20000);
      });

      describe('worker', function () {
        it('should have idleLimit prop', function () {
          expect(masterProcess.worker.idleLimit).toBe(3600000);
        });

        it('should have poolSize prop', function () {
          expect(masterProcess.worker.poolSize).toBe(1);
        });

        it('should have loaderFilePath prop', function () {
          expect(masterProcess.worker.loaderFilePath).toBe('node_modules/ewd-qoper8-worker.js');
        });

        it('should have loaderText prop', function () {
          expect(masterProcess.worker.loaderText).toEqual(
            jasmine.arrayContaining(['loader file'])
          );
        });

        it('should have process prop', function () {
          expect(masterProcess.worker.process).toEqual({});
        });

        it('should have list prop', function () {
          expect(masterProcess.worker.list).toEqual([]);
        });

        describe('debugPort', function () {
          afterEach(function () {
            process.execArgv = [];
          });

          it('should have debugPort prop', function () {
            expect(masterProcess.worker.debugPort).toBe(0);
          });

          describe('When --debug', function () {
            it('should use default value', function () {
              // ARRANGE
              process.execArgv = ['--debug'];

              // ACT
              masterProcess = new qoper8.masterProcess();

              // ASSERT
              expect(masterProcess.worker.debugPort).toBe(5858);
            });
          });

          describe('When --debug=5959', function () {
            it('should use custom value', function () {
              // ARRANGE
              process.execArgv = ['--debug=5959'];

              // ACT
              masterProcess = new qoper8.masterProcess();

              // ASSERT
              expect(masterProcess.worker.debugPort).toBe(5959);
            });
          });
        });

        describe('inspectPort', function () {
          afterEach(function () {
            process.execArgv = [];
          });

          it('should have inspectPort prop', function () {
            expect(masterProcess.worker.inspectPort).toBe(0);
          });

          describe('When --inspect', function () {
            it('should use default value', function () {
              // ARRANGE
              process.execArgv = ['--inspect'];

              // ACT
              masterProcess = new qoper8.masterProcess();

              // ASSERT
              expect(masterProcess.worker.inspectPort).toBe(9229);
            });
          });

          describe('When --inspect=9339', function () {
            it('should use custom value', function () {
              // ARRANGE
              process.execArgv = ['--inspect=9339'];

              // ACT
              masterProcess = new qoper8.masterProcess();

              // ASSERT
              expect(masterProcess.worker.inspectPort).toBe(9339);
            });
          });
        });
      });

      it('should have exitOnStop prop', function () {
        expect(masterProcess.exitOnStop).toBeTruthy();
      });

      it('should have master prop', function () {
        expect(masterProcess.master).toEqual({});
      });

      it('should have queue prop', function () {
        expect(masterProcess.queue).toEqual([]);
      });

      it('should have responseHandler prop', function () {
        expect(masterProcess.responseHandler).toEqual({});
      });

      it('should have eventId prop', function () {
        expect(masterProcess.eventId).toBe(0);
      });

      it('should have eventHash prop', function () {
        expect(masterProcess.eventHash).toEqual({});
      });

      it('should have started prop', function () {
        expect(masterProcess.started).toBeFalsy();
      });

      it('should have startTime prop', function () {
        expect(masterProcess.startTime).toBe(1483228800000);
      });

      describe('When `workerStarted` emitted', function () {
        it('should NOT call #processQueue', function () {
          // ARRANGE
          spyOn(masterProcess, 'processQueue');

          // ACT
          masterProcess.emit('workerStarted', 10100);

          // ASSERT
          expect(masterProcess.processQueue).not.toHaveBeenCalled();
        });

        describe('and customQueue', function () {
          it('should call #processQueue', function () {
            // ARRANGE
            var customQueue = true;
            spyOn(masterProcess, 'processQueue');

            // ACT
            masterProcess.emit('workerStarted', 10100, customQueue);

            // ASSERT
            expect(masterProcess.processQueue).toHaveBeenCalledWith(true);
          });
        });

        describe('and queue is not empty', function () {
          it('should call #processQueue', function () {
            // ARRANGE
            masterProcess.queue = [
              {
                type: 'foo'
              }
            ];
            spyOn(masterProcess, 'processQueue');

            // ACT
            masterProcess.emit('workerStarted', 10100);

            // ASSERT
            expect(masterProcess.processQueue).toHaveBeenCalled();
          });
        });
      });
    });

    describe('#version', function () {
      it('should be function', function () {
        expect(masterProcess.version).toEqual(jasmine.any(Function));
      });
    });

    describe('#upTime', function () {
      it('should be function', function () {
        expect(masterProcess.upTime).toEqual(jasmine.any(Function));
      });
    });

    describe('#getWorkerPids', function () {
      it('should be function', function () {
        expect(masterProcess.getWorkerPids).toEqual(jasmine.any(Function));
      });
    });

    describe('#getStats', function () {
      it('should be function', function () {
        expect(masterProcess.getStats).toEqual(jasmine.any(Function));
      });
    });

    describe('#start', function () {
      it('should be function', function () {
        expect(masterProcess.start).toEqual(jasmine.any(Function));
      });
    });

    describe('#stop', function () {
      it('should be function', function () {
        expect(masterProcess.stop).toEqual(jasmine.any(Function));
      });
    });

    describe('#startWorker', function () {
      it('should be function', function () {
        expect(masterProcess.startWorker).toEqual(jasmine.any(Function));
      });
    });

    describe('#stopWorker', function () {
      it('should be function', function () {
        expect(masterProcess.stopWorker).toEqual(jasmine.any(Function));
      });
    });

    describe('#getWorkerStats', function () {
      it('should be function', function () {
        expect(masterProcess.getWorkerStats).toEqual(jasmine.any(Function));
      });
    });

    describe('#getAllWorkerStats', function () {
      it('should be function', function () {
        expect(masterProcess.getAllWorkerStats).toEqual(jasmine.any(Function));
      });
    });

    describe('#getWorkerAvailability', function () {
      it('should be function', function () {
        expect(masterProcess.getWorkerAvailability).toEqual(jasmine.any(Function));
      });
    });

    describe('#addToQueue', function () {
      it('should be function', function () {
        expect(masterProcess.addToQueue).toEqual(jasmine.any(Function));
      });
    });

    describe('#processQueue', function () {
      it('should be function', function () {
        expect(masterProcess.processQueue).toEqual(jasmine.any(Function));
      });
    });

    describe('#getWorker', function () {
      it('should be function', function () {
        expect(masterProcess.getWorker).toEqual(jasmine.any(Function));
      });
    });

    describe('#sendRequestToWorker', function () {
      it('should be function', function () {
        expect(masterProcess.sendRequestToWorker).toEqual(jasmine.any(Function));
      });
    });

    describe('#toggleLogging', function () {
      it('should be function', function () {
        expect(masterProcess.toggleLogging).toEqual(jasmine.any(Function));
      });
    });

    describe('#setWorkerPoolSize', function () {
      it('should be function', function () {
        expect(masterProcess.setWorkerPoolSize).toEqual(jasmine.any(Function));
      });
    });

    describe('#setWorkerIdleLimit', function () {
      it('should be function', function () {
        expect(masterProcess.setWorkerIdleLimit).toEqual(jasmine.any(Function));
      });
    });

    describe('#handleMessage', function () {
      it('should be function', function () {
        expect(masterProcess.handleMessage).toEqual(jasmine.any(Function));
      });
    });

    describe('#handleStats', function () {
      it('should be function', function () {
        expect(masterProcess.handleStats).toEqual(jasmine.any(Function));
      });
    });
  });

  describe('workerProcess', function () {
    var workerProcess = null;

    beforeEach(function () {
      workerProcess = new qoper8.workerProcess();
    });

    afterEach(function () {
      workerProcess = null;
    });

    describe('initial props', function () {
      it('should have moduleName prop', function () {
        expect(workerProcess.moduleName).toBe('ewd-qoper8 Worker Process');
      });

      it('should have build prop', function () {
        expect(workerProcess.build).toEqual(
          jasmine.objectContaining({
            no: 'x.x.x',
            date: '1 January 1970'
          })
        );
      });

      it('should have isFirst prop', function () {
        expect(workerProcess.isFirst).toBeFalsy();
      });

      it('should have environment prop', function () {
        expect(workerProcess.environment).toEqual({});
      });

      it('should have count prop', function () {
        expect(workerProcess.count).toBe(0);
      });
    });

    it('should be instance of EventEmitter', function () {
      expect(workerProcess instanceof events.EventEmitter).toBeTruthy();
    });

    describe('#version', function () {
      it('should be function', function () {
        expect(workerProcess.version).toEqual(jasmine.any(Function));
      });
    });

    describe('#init', function () {
      it('should be function', function () {
        expect(workerProcess.init).toEqual(jasmine.any(Function));
      });
    });

    describe('#upTime', function () {
      it('should be function', function () {
        expect(workerProcess.upTime).toEqual(jasmine.any(Function));
      });
    });

    describe('#getStats', function () {
      it('should be function', function () {
        expect(workerProcess.getStats).toEqual(jasmine.any(Function));
      });
    });

    describe('#returnMessage', function () {
      it('should be function', function () {
        expect(workerProcess.returnMessage).toEqual(jasmine.any(Function));
      });
    });

    describe('#sendMessage', function () {
      it('should be function', function () {
        expect(workerProcess.sendMessage).toEqual(jasmine.any(Function));
      });
    });

    describe('#hasFinished', function () {
      it('should be function', function () {
        expect(workerProcess.hasFinished).toEqual(jasmine.any(Function));
      });
    });

    describe('#hasStarted', function () {
      it('should be function', function () {
        expect(workerProcess.hasStarted).toEqual(jasmine.any(Function));
      });
    });

    describe('#exit', function () {
      it('should be function', function () {
        expect(workerProcess.exit).toEqual(jasmine.any(Function));
      });
    });
  });
});
