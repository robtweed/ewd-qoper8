var addToQueue = require('../../../../lib/master/proto/addToQueue');

describe('unit/master/proto/addToQueue:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.queue = [];
      this.emit = jasmine.createSpy();
      this.processQueue = jasmine.createSpy();
      this.addToQueue = addToQueue;
    };
  });

  it('should emit `toQueue` event and pass request object', function () {
    // ARRANGE
    var requestObj = {
      type: 'foo'
    };

    masterProcess = new MasterProcess();
    masterProcess.emit.and.returnValue(true);

    // ACT
    masterProcess.addToQueue(requestObj);

    // ASSERT
    expect(masterProcess.emit).toHaveBeenCalledWith('toQueue', requestObj);
  });

  describe('when handler NOT found', function () {
    beforeEach(function () {
      masterProcess = new MasterProcess();
      masterProcess.emit.and.returnValue(false);
    });

    it('should add requestObj to queue', function () {
      // ARRANGE
      var requestObj = {
        type: 'foo'
      };

      // ACT
      masterProcess.addToQueue(requestObj);

      // ASSERT
      expect(masterProcess.queue).toEqual([
        {
          type: 'foo'
        }
      ]);
    });

    it('should call #processQueue without parameters', function () {
      // ARRANGE
      var requestObj = {
        type: 'foo'
      };

      // ACT
      masterProcess.addToQueue(requestObj);

      // ASSERT
      expect(masterProcess.processQueue).toHaveBeenCalled();
    });
  });
});
