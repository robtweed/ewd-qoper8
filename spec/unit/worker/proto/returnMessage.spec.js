var returnMessage = require('../../../../lib/worker/proto/returnMessage');

describe(' - unit/worker/proto/returnMessage:', function () {
  var WorkerProcess;
  var workerProcess;

  beforeAll(function () {
    WorkerProcess = function () {
      this.returnMessage = returnMessage;
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
    var type = 'foo';
    var message = {
      bar: 'baz'
    };

    workerProcess = new WorkerProcess();

    // ACT
    workerProcess.returnMessage(type, message);

    // ASSERT
    expect(process.send).toHaveBeenCalledWith({
      type: 'foo',
      finished: false,
      message: {
        bar: 'baz'
      }
    });
  });
});
