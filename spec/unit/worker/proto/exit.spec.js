var exit = require('../../../../lib/worker/proto/exit');

describe(' - unit/worker/proto/exit:', function () {
  var WorkerProcess;
  var workerProcess;

  beforeAll(function () {
    WorkerProcess = function () {
      this.exit = exit;
    };
  });

  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('should call process.exit in 500 ms', function () {
    // ARRANGE
    spyOn(process, 'exit');

    workerProcess = new WorkerProcess();

    // ACT
    workerProcess.exit();
    jasmine.clock().tick(501);

    // ASSERT
    expect(process.exit).toHaveBeenCalled();
  });
});
