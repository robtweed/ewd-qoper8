var checkWorkerPool = require('../../../../lib/master/proto/checkWorkerPool');

describe(' - unit/master/proto/checkWorkerPool:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.worker = {
        list: [10100, 10200],
        idleLimit: 20 * 60 * 1000,
        process: {
          10100: {
            isAvailable: true
          },
          10200: {
            isAvailable: true
          }
        }
      };
      this.stopWorker = function (pid) {
        delete this.worker.process[pid];

        this.worker.list = [];
        Object.keys(this.worker.process).forEach(function (x) {
          this.worker.list.push(parseInt(x, 10));
        }, this);
      };
      this.checkWorkerPool = checkWorkerPool;
    };
  });

  beforeEach(function () {
    jasmine.clock().install();

    masterProcess = new MasterProcess();
    spyOn(masterProcess, 'stopWorker').and.callThrough();
  });

  afterEach(function () {
    jasmine.clock().uninstall();

    masterProcess = null;
  });

  it('should init checkWorkerPoolTimer', function () {
    // ACT
    masterProcess.checkWorkerPool();

    // ASSERT
    expect(masterProcess.checkWorkerPoolTimer).toEqual(jasmine.any(Number));
  });

  it('should init checkWorkerPoolTimer', function () {
    // ARRANGE
    var nowUtc = new Date(Date.UTC(2017, 0, 1, 12, 30));
    jasmine.clock().mockDate(nowUtc);

    masterProcess.worker.process[10100].time = new Date(Date.UTC(2017, 0, 1, 12, 10));
    masterProcess.worker.process[10200].time = new Date(Date.UTC(2017, 0, 1, 12, 20));

    // ACT
    masterProcess.checkWorkerPool();
    jasmine.clock().tick(5 * 60 * 1000);

    // ASSERT
    expect(masterProcess.stopWorker).toHaveBeenCalledWith(10100);
    expect(masterProcess.stopWorker).not.toHaveBeenCalledWith(10200);
  });

  describe('When log enabled', function () {
    beforeEach(function () {
      masterProcess.log = true;
    });

    it('should produce correct message to log output', function () {
      spyOn(console, 'log');

      var nowUtc = new Date(Date.UTC(2017, 0, 1, 12, 30));
      jasmine.clock().mockDate(nowUtc);

      masterProcess.worker.process[10100].time = new Date(Date.UTC(2017, 0, 1, 12, 10));
      masterProcess.worker.process[10200].time = new Date(Date.UTC(2017, 0, 1, 12, 20));

      // ACT
      masterProcess.checkWorkerPool();
      jasmine.clock().tick(5 * 60 * 1000);

      // ASSERT
      expect(console.log.calls.count()).toBe(2);
      expect(console.log.calls.argsFor(0)).toEqual(['10100: idle for 1500000 (limit = 1200000); Available: true']);
      expect(console.log.calls.argsFor(1)).toEqual(['10200: idle for 900000 (limit = 1200000); Available: true']);
    });
  });
});
