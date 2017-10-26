var getAllWorkerStats = require('../../../../lib/master/proto/getAllWorkerStats');

describe('unit/master/proto/getAllWorkerStats:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    var pids = [10, 20];

    MasterProcess = function () {
      this.getWorkerPids = jasmine.createSpy().and.returnValue(pids);
      this.getWorkerStats = jasmine.createSpy();
      this.getAllWorkerStats = getAllWorkerStats;
    };
  });

  it('should call #getWorkerPids without parameters', function () {
    // ARRANGE
    var id = 12345;

    masterProcess = new MasterProcess();

    // ACT
    masterProcess.getAllWorkerStats(id);

    // ASSERT
    expect(masterProcess.getWorkerPids).toHaveBeenCalled();
  });

  it('should call #getWorkerStats for every worker pid', function () {
    // ARRANGE
    var id = 12345;

    masterProcess = new MasterProcess();

    // ACT
    masterProcess.getAllWorkerStats(id);

    // ASSERT
    expect(masterProcess.getWorkerStats.calls.count()).toBe(2);
    expect(masterProcess.getWorkerStats.calls.argsFor(0)).toEqual([10, 12345]);
    expect(masterProcess.getWorkerStats.calls.argsFor(1)).toEqual([20, 12345]);
  });
});
