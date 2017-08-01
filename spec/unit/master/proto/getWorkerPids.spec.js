var getWorkerPids = require('../../../../lib/master/proto/getWorkerPids');

describe(' - unit/master/proto/getWorkerPids:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.worker = {
        list: [10, 20, 30]
      };
      this.getWorkerPids = getWorkerPids;
    };
  });

  it('should return worker pids', function () {
    // ARRANGE
    var expected = [10, 20, 30];

    masterProcess = new MasterProcess();

    // ACT
    var actual = masterProcess.getWorkerPids();

    // ASSERT
    expect(actual).toEqual(expected);
  });
});
