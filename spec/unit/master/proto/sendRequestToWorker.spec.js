var sendRequestToWorker = require('../../../../lib/master/proto/sendRequestToWorker');

describe(' - unit/master/proto/sendRequestToWorker:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.queue = [
        {
          type: 'foo'
        }
      ];
      this.worker = {
        process: {}
      };
      this.emit = jasmine.createSpy();
      this.addToQueue = jasmine.createSpy();
      this.sendRequestToWorker = sendRequestToWorker;
    };
  });

  beforeEach(function () {
    masterProcess = new MasterProcess();
  });

  it('should dequeue item from queue', function () {
    // ARRANGE
    var pid = 10200;

    // ACT
    masterProcess.sendRequestToWorker(pid);

    // ASSERT
    expect(masterProcess.queue).toEqual([]);
  });

  it('should call `beforeDispatch` event with correct arguments', function () {
    // ARRANGE
    var pid = 10200;

    // ACT
    masterProcess.sendRequestToWorker(pid);

    // ASSERT
    expect(masterProcess.emit).toHaveBeenCalledWith('beforeDispatch', {
      type: 'foo'
    }, 10200);
  });

  it('should find process by pid and call send with correct arguments', function () {
    // ARRANGE
    var pid = 10200;

    masterProcess.worker.process[pid] = {
      send: jasmine.createSpy()
    };

    // ACT
    masterProcess.sendRequestToWorker(pid);

    // ASSERT
    expect(masterProcess.worker.process[pid].send).toHaveBeenCalledWith({
      type: 'foo'
    });
  });

  describe('When unable to send to worker', function () {
    it('should add item back to queue', function () {
      // ARRANGE
      var pid = 10200;

      masterProcess.worker.process[pid] = {
        send: jasmine.createSpy().and.throwError()
      };

      // ACT
      masterProcess.sendRequestToWorker(pid);

      // ASSERT
      expect(masterProcess.addToQueue).toHaveBeenCalledWith({
        type: 'foo'
      });
    });

    describe('When log enabled', function () {
      beforeEach(function () {
        masterProcess.log = true;
      });

      it('should produce correct message to log output', function () {
        // ARRANGE
        var pid = 10200;

        masterProcess.worker.process[pid] = {
          send: jasmine.createSpy().and.throwError()
        };

        spyOn(console, 'log');

        // ACT
        masterProcess.sendRequestToWorker(pid);

        // ASSERT
        expect(console.log).toHaveBeenCalledWith('sendRequestToWorker error: unable to send to worker 10200');
      });
    });
  });
});
