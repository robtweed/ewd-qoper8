var getStats = require('../../../../lib/worker/proto/getStats');

describe('unit/worker/proto/getStats:', function () {
  var WorkerProcess;
  var workerProcess;

  beforeAll(function () {
    WorkerProcess = function () {
      this.upTime = jasmine.createSpy().and.returnValue('2 days 12:00:00');
      this.count = 1;
      this.getStats = getStats;
    };
  });

  it('should return statistic', function () {
    // ARRANGE
    spyOn(process, 'memoryUsage').and.returnValue({
      rss: 200 * 1024 * 1024,
      heapTotal: 1200 * 1024 * 1024,
      heapUsed: 300 * 1024 * 1024,
    });

    workerProcess = new WorkerProcess();

    // ACT
    var actual = workerProcess.getStats();

    // ASSERT
    expect(actual).toEqual({
      pid: process.pid,
      uptime: '2 days 12:00:00',
      noOfMessages: 1,
      memory: {
        rss: '200.00',
        heapTotal: '1200.00',
        heapUsed: '300.00'
      }
    });
  });
});
