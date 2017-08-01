var events = require('events');
var stop = require('../../../../lib/master/proto/stop');

describe(' - unit/master/proto/stop:', function () {
  var WorkerProcess;
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    WorkerProcess = function (pid) {
      this.pid = pid;

      events.EventEmitter.call(this);
    };

    WorkerProcess.prototype = Object.create(events.EventEmitter.prototype);
    WorkerProcess.prototype.constructor = WorkerProcess;

    MasterProcess = function () {
      this.shutdownDelay = 5000;
      this.emit = jasmine.createSpy();
      this.getWorkerPids = jasmine.createSpy();
      this.stopWorker = jasmine.createSpy();
      this.stop = stop;
    };
  });

  beforeEach(function() {
    jasmine.clock().install();
    masterProcess = new MasterProcess();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    masterProcess = null;
  });

  describe('When no worker processes running', function () {
    beforeEach(function () {
      masterProcess.getWorkerPids.and.returnValue([]);
    });

    it('should shutdown master process', function () {
      // ARRANGE
      spyOn(process, 'exit');

      // ACT
      masterProcess.stop();

      // ASSERT
      expect(masterProcess.stopping).toBeTruthy();
      expect(masterProcess.emit).toHaveBeenCalledWith('stop');
      expect(process.exit).toHaveBeenCalled();
    });
  });

  describe('When worker processes are running', function () {
    beforeEach(function () {
      masterProcess.getWorkerPids.and.returnValue([10100, 10200]);
      masterProcess.worker = {
        process: {
          10100: new WorkerProcess(10100),
          10200: new WorkerProcess(10200)
        }
      };
    });

    it('should clean internal state', function () {
      // ARRANGE
      masterProcess.queue = [{
        type: 'foo'
      }];

      // ACT
      masterProcess.stop();

      // ASSERT
      expect(masterProcess.stopping).toBeTruthy();
      expect(masterProcess.queue).toEqual([]);
    });

    it('should stop checkWorkerPoolTimer', function () {
      // ARRANGE
      var callback = jasmine.createSpy();
      masterProcess.checkWorkerPoolTimer = setTimeout(callback, 100);

      // ACT
      masterProcess.stop();
      jasmine.clock().tick(200);

      // ASSERT
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call #stopWorker', function () {
      // ACT
      masterProcess.stop();

      // ASSERT
      expect(masterProcess.stopWorker.calls.count()).toBe(2);
      expect(masterProcess.stopWorker.calls.argsFor(0)).toEqual(['10100']);
      expect(masterProcess.stopWorker.calls.argsFor(1)).toEqual(['10200']);
    });

    describe('When all worker processes stopped successfully', function () {
      it('should shutdown master process', function () {
        // ARRANGE
        spyOn(process, 'exit');

        // ACT
        masterProcess.stop();
        masterProcess.worker.process[10100].emit('exit');
        masterProcess.worker.process[10200].emit('exit');

        // ASSERT
        expect(masterProcess.emit).toHaveBeenCalledWith('stop');
        expect(process.exit).toHaveBeenCalled();
      });
    });

    describe('When at least one worker processes NOT stopped successfully', function () {
      it('should shutdown master process anyway', function () {
        // ARRANGE
        spyOn(process, 'exit');

        // ACT
        masterProcess.stop();
        masterProcess.worker.process[10100].emit('exit');
        jasmine.clock().tick(masterProcess.shutdownDelay + 100);

        // ASSERT
        expect(masterProcess.emit).toHaveBeenCalledWith('stop');
        expect(process.exit).toHaveBeenCalled();
      });
    });
  });
});
