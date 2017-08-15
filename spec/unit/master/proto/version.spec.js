var version = require('../../../../lib/master/proto/version');

describe(' - unit/master/proto/version:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.build = {
        no: 'x.x.x',
        date: '1 January 1970'
      };
      this.moduleName = 'ewd-qoper8 Test Worker Process';
      this.version = version;
    };
  });

  it('should return correct version', function () {
    // ARRANGE
    masterProcess = new MasterProcess();

    // ACT
    var actual = masterProcess.version();

    // ASSERT
    expect(actual).toBe('ewd-qoper8 Test Worker Process Build x.x.x; 1 January 1970');
  });
});
