var upTime = require('../../../../lib/master/proto/upTime');

describe(' - unit/master/proto/upTime:', function () {
  var MasterProcess;
  var masterProcess;
  var days;
  var hrs;
  var mins;
  var secs;

  beforeAll(function () {
    MasterProcess = function () {
      this.startTime = new Date().getTime();
      this.upTime = upTime;
    };
  });

  beforeEach(function() {
    jasmine.clock().install();

    days = 2 * 24 * 60 * 60;
    hrs = 9 * 60 * 60;
    mins = 11 * 60;
    secs = 34;
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('should return uptime', function () {
    // ARRANGE
    var nowUtc = new Date(Date.UTC(2017, 0, 1));
    jasmine.clock().mockDate(nowUtc);

    masterProcess = new MasterProcess();

    var millis = (days + hrs + mins + secs) * 1000;
    jasmine.clock().tick(millis);

    // ACT
    var actual = masterProcess.upTime();

    // ASSERT
    expect(actual).toBe('2 days 9:11:34');
  });

  describe('When mins less than 10', function () {
    beforeEach(function () {
      mins = 9 * 60;
    });

    it('should return uptime', function () {
      // ARRANGE
      var nowUtc = new Date(Date.UTC(2017, 0, 1));
      jasmine.clock().mockDate(nowUtc);

      masterProcess = new MasterProcess();

      var millis = (days + hrs + mins + secs) * 1000;
      jasmine.clock().tick(millis);

      // ACT
      var actual = masterProcess.upTime();

      // ASSERT
      expect(actual).toBe('2 days 9:09:34');
    });
  });

  describe('When secs greater than 10', function () {
    beforeEach(function () {
      secs = 9;
    });

    it('should return uptime', function () {
      // ARRANGE
      var nowUtc = new Date(Date.UTC(2017, 0, 1));
      jasmine.clock().mockDate(nowUtc);

      masterProcess = new MasterProcess();

      var millis = (days + hrs + mins + secs) * 1000;
      jasmine.clock().tick(millis);

      // ACT
      var actual = masterProcess.upTime();

      // ASSERT
      expect(actual).toBe('2 days 9:11:09');
    });
  });
});
