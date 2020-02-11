var processQueue = require('../../../../lib/master/proto/processQueue');

describe('unit/master/proto/processQueue:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.queue.push(
        {
          type: 'foo'
        }
      );
      this.worker = {
        poolSize: 2
      };
      this.emit = jasmine.createSpy();
      this.getWorker = jasmine.createSpy();
      this.sendRequestToWorker = jasmine.createSpy();
      this.startWorker = jasmine.createSpy();
      this.processQueue = processQueue;
    };
  });

  beforeEach(function () {
    masterProcess = new MasterProcess();
  });

  describe('When master process stopped', function () {
    it('should do nothing', function () {
      // ARRANGE
      masterProcess.stopping = true;

      // ACT
      masterProcess.processQueue();

      // ASSERT
      expect(masterProcess.getWorker).not.toHaveBeenCalled();
    });
  });

  describe('When queue is empty', function () {
    beforeEach(function () {
      masterProcess.queue.clear();
    });

    describe('and customQueue falsy', function () {
      it('should do nothing', function () {
        // ACT
        masterProcess.processQueue();

        // ASSERT
        expect(masterProcess.getWorker).not.toHaveBeenCalled();
      });
    });
  });

  it('should call #getWorker', function () {
    // ARRANGE
    masterProcess.getWorker.and.returnValue({});

    // ACT
    masterProcess.processQueue();

    // ASSERT
    expect(masterProcess.getWorker).toHaveBeenCalled();
  });

  describe('When #getWorker returns available worker', function () {
    beforeEach(function () {
      masterProcess.getWorker.and.returnValue({
        pid: 10
      });
    });

    it('should emit `dispatch` event with correct arguments', function () {
      // ARRANGE
      masterProcess.emit.and.returnValue(true);

      // ACT
      masterProcess.processQueue();

      // ASSERT
      expect(masterProcess.emit).toHaveBeenCalledWith('dispatch', 10);
    });

    describe('and NO handler found', function () {
      var processQueue;

      beforeEach(function () {
        masterProcess.log = true;
        masterProcess.queue.push(
          {
            type: 'foo'
          }
        );

        // create un-spied version of the function to call to avoid the spy loop
        processQueue = masterProcess.processQueue.bind(masterProcess);
      });

      it('should call #sendRequestToWorker with correct arguments', function () {
        // ARRANGE
        spyOn(masterProcess, 'processQueue');

        // ACT
        processQueue();

        // ASSERT
        expect(masterProcess.sendRequestToWorker).toHaveBeenCalledWith(10);
      });

      describe('and there is any more requests on the queue', function () {
        it('should run #processQueue again', function () {
          // ARRANGE
          spyOn(masterProcess, 'processQueue');

          // ACT
          processQueue();

          // ASSERT
          expect(masterProcess.processQueue).toHaveBeenCalled();
        });
      });

      describe('and there is NOT requests on the queue', function () {
        beforeEach(function () {
          masterProcess.queue.clear();
        });

        it('should NOT run #processQueue again', function () {
          // ARRANGE
          spyOn(masterProcess, 'processQueue');

          // ACT
          processQueue();

          // ASSERT
          expect(masterProcess.processQueue).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('When #getWorker returns NO available worker', function () {
    beforeEach(function () {
      masterProcess.log = true;
      masterProcess.getWorker.and.returnValue({
        pid: false,
        count: 3
      });
    });

    describe('and poolSize greater than started workers count', function () {
      beforeEach(function () {
        masterProcess.worker.poolSize = 5;
      });

      it('should start a new worker', function () {
        // ARRANGE
        var customQueue = true;

        // ACT
        masterProcess.processQueue(customQueue);

        // ASSERT
        expect(masterProcess.startWorker).toHaveBeenCalledWith(customQueue);
      });
    });

    describe('and poolSize less or equal than started workers count', function () {
      beforeEach(function () {
        masterProcess.worker.poolSize = 1;
      });

      it('should NOT start a new worker', function () {
        // ACT
        masterProcess.processQueue();

        // ASSERT
        expect(masterProcess.startWorker).not.toHaveBeenCalled();
      });
    });
  });
});
