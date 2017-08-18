var stopWorker = require('../../../../lib/master/proto/stopWorker');

describe(' - unit/master/proto/stopWorker:', function () {
  var WorkerProcess;
  var MasterProcess;
  var workerProcess1;
  var workerProcess2;
  var masterProcess;

  beforeAll(function () {
    WorkerProcess = function (pid) {
      this.pid = pid;
      this.send = jasmine.createSpy();
    };

    MasterProcess = function (workers) {
      this.worker = {
        list: [],
        process: {}
      };
      this.stopWorker = stopWorker;

      workers.forEach(function (worker) {
        this.worker.list.push(worker.pid);
        this.worker.process[worker.pid] = worker;
      }, this);
    };
  });

  beforeEach(function () {
    workerProcess1 = new WorkerProcess(10100);
    workerProcess2 = new WorkerProcess(10200);
    masterProcess = new MasterProcess([workerProcess1, workerProcess2]);
  });

  afterEach(function () {
    workerProcess1 = null;
    workerProcess2 = null;
    masterProcess = null;
  });

  it('should signalling worker to stop', function () {
    // ARRANGE
    var pid = 10100;

    // ACT
    masterProcess.stopWorker(pid);

    // ASSERT
    expect(workerProcess1.send).toHaveBeenCalledWith({
      type: 'qoper8-exit'
    });
  });

  it('should delete worker process', function () {
    // ARRANGE
    var pid = 10100;

    // ACT
    masterProcess.stopWorker(pid);

    // ASSERT
    expect(masterProcess.worker.process[pid]).toBeUndefined();
  });

  it('should rebuild array of current worker process pids', function () {
    // ARRANGE
    var pid = 10100;

    // ACT
    masterProcess.stopWorker(pid);

    // ASSERT
    expect(masterProcess.worker.list).toEqual([10200]);
  });
});
