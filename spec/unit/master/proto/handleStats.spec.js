var handleStats = require('../../../../lib/master/proto/handleStats');

describe('unit/master/proto/handleStats:', function () {
  var MasterProcess;
  var masterProcess;

  var stats = {
    pid: 123,
    uptime: 30,
    queueLength: 2,
    memory: {
      rss: '2.00',
      heapTotal: '12.00',
      heapUsed: '3.00'
    }
  };

  beforeAll(function () {
    MasterProcess = function () {
      this.eventId = 0;
      this.eventHash = {};
      this.getWorkerPids = jasmine.createSpy();
      this.getStats = jasmine.createSpy().and.returnValue(stats);
      this.getAllWorkerStats = jasmine.createSpy();
      this.handleStats = handleStats;
    };
  });

  it('should call #getWorkerPids', function () {
    // ARRANGE
    var callback = jasmine.createSpy();

    masterProcess = new MasterProcess();
    masterProcess.getWorkerPids.and.returnValue([]);

    // ACT
    masterProcess.handleStats(callback);

    // ASSERT
    expect(masterProcess.getWorkerPids).toHaveBeenCalled();
  });

  describe('when NO workers exist', function () {
    it('should call #getStats and return callback with correct arguments', function () {
      // ARRANGE
      var callback = jasmine.createSpy();

      masterProcess = new MasterProcess();
      masterProcess.getWorkerPids.and.returnValue([]);

      // ACT
      masterProcess.handleStats(callback);

      // ASSERT
      expect(masterProcess.getStats).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(stats);
    });
  });

  describe('when at least one worker exists', function () {
    beforeEach(function () {
      masterProcess = new MasterProcess();
      masterProcess.getWorkerPids.and.returnValue([10]);
    });

    it('should call #getStats', function () {
      // ARRANGE
      var callback = jasmine.createSpy();

      // ACT
      masterProcess.handleStats(callback);

      // ASSERT
      expect(masterProcess.getStats).toHaveBeenCalled();
    });

    it('should call #getAllWorkerStats', function () {
      // ARRANGE
      var callback = jasmine.createSpy();

      // ACT
      masterProcess.handleStats(callback);

      // ASSERT
      expect(masterProcess.getAllWorkerStats).toHaveBeenCalledWith(1);
    });

    it('should create new event hash object', function () {
      // ARRANGE
      var callback = jasmine.createSpy();

      // ACT
      masterProcess.handleStats(callback);

      // ASSERT
      var hash = masterProcess.eventHash[1];

      expect(hash.count).toBe(0);
      expect(hash.data.master).toBe(stats);
      expect(hash.data.worker).toEqual([]);
      expect(hash.callback).toBe(callback);
      expect(hash.max).toBe(1);
    });
  });
});
