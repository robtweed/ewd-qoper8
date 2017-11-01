var hasStarted = require('../../../../lib/worker/proto/hasStarted');

describe('unit/worker/proto/hasStarted:', function () {
  var WorkerProcess;
  var workerProcess;

  beforeAll(function () {
    WorkerProcess = function () {
      this.hasStarted = hasStarted;
    };
  });

  beforeEach(function () {
    process.send = jasmine.createSpy();
  });

  afterEach(function () {
    delete process.send;
  });

  it('should call process.send with correct arguments', function () {
    // ARRANGE
    workerProcess = new WorkerProcess();

    // ACT
    workerProcess.hasStarted();

    // ASSERT
    expect(process.send).toHaveBeenCalledWith({
      type: 'workerProcessStarted',
      ok: process.pid
    });
  });
});
