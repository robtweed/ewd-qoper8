var getWorker = require('../../../../lib/master/proto/getWorker');

describe('unit/master/proto/getWorker:', function () {
  var MasterProcess;
  var WorkerProcess;
  var masterProcess;

  beforeAll(function () {
    WorkerProcess = function (isAvailable) {
      this.isAvailable = isAvailable;
      this.totalRequests = 0;
    };

    MasterProcess = function () {
      this.worker = {
        list: [],
        process: {}
      };
      this.getWorker = getWorker;
    };
  });

  beforeEach(function () {
    masterProcess = new MasterProcess();

    masterProcess.worker.list = [10, 20];
    masterProcess.worker.process[10] = new WorkerProcess(false);
    masterProcess.worker.process[20] = new WorkerProcess(true);
  });

  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('should return first available worker pid and update its state', function () {
    // ARRANGE
    var nowUtc = new Date(Date.UTC(2017, 0, 1));
    jasmine.clock().mockDate(nowUtc);

    // ACT
    var actual = masterProcess.getWorker();

    // ASSERT
    var worker = masterProcess.worker.process[actual.pid];
    expect(actual).toEqual({
      pid: 20
    });
    expect(worker.isAvailable).toBeFalsy();
    expect(worker.totalRequests).toBe(1);
    expect(worker.time).toBe(1483228800000);
  });

  describe('when no available workers', function () {
    beforeEach(function () {
      masterProcess.worker.process[20].isAvailable = false;
    });

    it('should return pid equals false and started workers count', function () {
      // ACT
      var actual = masterProcess.getWorker();

      // ASSERT
      expect(actual).toEqual({
        pid: false,
        count: 2
      });
    });
  });
});
