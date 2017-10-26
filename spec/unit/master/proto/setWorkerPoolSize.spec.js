var setWorkerPoolSize = require('../../../../lib/master/proto/setWorkerPoolSize');

describe('unit/master/proto/setWorkerPoolSize:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.worker = {};
      this.setWorkerPoolSize = setWorkerPoolSize;
    };
  });

  it('should set worker pool size', function () {
    // ARRANGE
    var noOfWorkers = 5;

    masterProcess = new MasterProcess();

    // ACT
    masterProcess.setWorkerPoolSize(noOfWorkers);

    // ASSERT
    expect(masterProcess.worker.poolSize).toBe(noOfWorkers);
  });
});
