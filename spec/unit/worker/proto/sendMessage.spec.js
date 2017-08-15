var sendMessage = require('../../../../lib/worker/proto/sendMessage');

describe(' - unit/worker/proto/sendMessage:', function () {
  var WorkerProcess;
  var workerProcess;

  beforeAll(function () {
    WorkerProcess = function () {
      this.suppressLog = {};
      this.sendMessage = sendMessage;
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
    var socketId = 'socketId';

    workerProcess = new WorkerProcess();

    // ACT
    workerProcess.sendMessage(type, message, socketId);

    // ASSERT
    expect(process.send).toHaveBeenCalledWith({
      type: 'foo',
      finished: false,
      message: {
        bar: 'baz'
      },
      socketId: 'socketId'
    });
  });

  describe(' when suppressLog enabled', function() {
    it('should call process.send with passing `dontLog`', function () {
      // ARRANGE
      var type = 'foo';
      var message = {
        bar: 'baz'
      };
      var socketId = 'socketId';

      workerProcess = new WorkerProcess();
      workerProcess.suppressLog[type] = true;

      // ACT
      workerProcess.sendMessage(type, message, socketId);

      // ASSERT
      expect(process.send).toHaveBeenCalledWith({
        type: 'foo',
        finished: false,
        dontLog: true,
        message: {
          bar: 'baz'
        },
        socketId: 'socketId'
      });
    });
  });
});
