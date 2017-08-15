var setWorkerIdleLimit = require('../../../../lib/master/proto/setWorkerIdleLimit');

describe(' - unit/master/proto/setWorkerIdleLimit:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.worker = {};
      this.setWorkerIdleLimit = setWorkerIdleLimit;
    };
  });

  it('should set worker idle limit', function () {
    // ARRANGE
    var time = 133;

    masterProcess = new MasterProcess();

    // ACT
    masterProcess.setWorkerIdleLimit(time);

    // ASSERT
    expect(masterProcess.worker.idleLimit).toBe(133);
  });
});
