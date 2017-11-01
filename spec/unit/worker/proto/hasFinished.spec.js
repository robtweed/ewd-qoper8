var hasFinished = require('../../../../lib/worker/proto/hasFinished');

describe('unit/worker/proto/hasFinished:', function () {
  var WorkerProcess;
  var workerProcess;

  beforeAll(function () {
    WorkerProcess = function () {
      this.suppressLog = {};
      this.hasFinished = hasFinished;
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
    workerProcess.hasFinished(type, message);

    // ASSERT
    expect(process.send).toHaveBeenCalledWith({
      type: 'foo',
      finished: true,
      message: {
        bar: 'baz'
      }
    });
  });

  describe('when suppressLog enabled', function() {
    it('should call process.send with passing `dontLog`', function () {
      // ARRANGE
      var type = 'foo';
      var message = {
        bar: 'baz'
      };

      workerProcess = new WorkerProcess();
      workerProcess.suppressLog[type] = true;

      // ACT
      workerProcess.hasFinished(type, message);

      // ASSERT
      expect(process.send).toHaveBeenCalledWith({
        type: 'foo',
        finished: true,
        dontLog: true,
        message: {
          bar: 'baz'
        }
      });
    });
  });
});
