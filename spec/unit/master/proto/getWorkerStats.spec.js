var getWorkerStats = require('../../../../lib/master/proto/getWorkerStats');

describe(' - unit/master/proto/getWorkerStats:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.worker = {
        process: {}
      };
      this.getWorkerStats = getWorkerStats;
    };
  });

  it('should find process by pid and call send with correct arguments', function () {
    // ARRANGE
    var pid = 10;
    var id = 12345;

    masterProcess = new MasterProcess();
    masterProcess.worker.process[pid] = {
      send: jasmine.createSpy()
    };

    // ACT
    masterProcess.getWorkerStats(pid, id);

    // ASSERT
    expect(masterProcess.worker.process[pid].send).toHaveBeenCalledWith({
      type: 'qoper8-getStats',
      id: 12345
    });
  });
});
