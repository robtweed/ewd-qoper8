var getStats = require('../../../../lib/master/proto/getStats');

describe(' - unit/master/proto/getStats:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.queue = [
        {
          type: 'foo'
        },
        {
          type: 'bar'
        }
      ];
      this.upTime = jasmine.createSpy().and.returnValue('6 days 12:15:34');
      this.getWorkerPids = jasmine.createSpy().and.returnValue([10, 20]);
      this.getStats = getStats;
    };
  });

  it('should return statistic', function () {
    // ARRANGE
    spyOn(process, 'memoryUsage').and.returnValue({
      rss: 2 * 1024 * 1024,
      heapTotal: 12 * 1024 * 1024,
      heapUsed: 3 * 1024 * 1024,
    });

    masterProcess = new MasterProcess();

    // ACT
    var actual = masterProcess.getStats();

    // ASSERT
    expect(actual.pid).toBe(process.pid);
    expect(actual.uptime).toBe('6 days 12:15:34');
    expect(actual.queueLength).toBe(2);
    expect(actual.workerProcesses).toEqual([10, 20]);
    expect(actual.memory.rss).toBe('2.00');
    expect(actual.memory.heapTotal).toBe('12.00');
    expect(actual.memory.heapUsed).toBe('3.00');

  });
});
