var getWorkerAvailability = require('../../../../lib/master/proto/getWorkerAvailability');

describe('unit/master/proto/getWorkerAvailability:', function () {
  var MasterProcess;
  var WorkerProcess;
  var masterProcess;

  beforeAll(function () {
    WorkerProcess = function (isAvailable) {
      this.isAvailable = isAvailable;
    };

    MasterProcess = function () {
      this.worker = {
        process: {
          10100: new WorkerProcess(true),
          10200: new WorkerProcess(false)
        }
      };
      this.getWorkerPids = jasmine.createSpy().and.returnValue([10100, 10200]);
      this.getWorkerAvailability = getWorkerAvailability;
    };
  });

  beforeEach(function () {
    masterProcess = new MasterProcess();
  });

  it('should call #getWorkerPids', function () {
    // ARRANGE
    var callback = jasmine.createSpy();

    // ACT
    masterProcess.getWorkerAvailability(callback);

    // ASSERT
    expect(masterProcess.getWorkerPids).toHaveBeenCalled();
  });

  it('should return worker availability', function () {
    // ARRANGE
    var callback = jasmine.createSpy();
    var expected = {
      10100: true,
      10200: false
    };

    // ACT
    masterProcess.getWorkerAvailability(callback);

    // ASSERT
    expect(callback).toHaveBeenCalledWith(expected);
  });
});
