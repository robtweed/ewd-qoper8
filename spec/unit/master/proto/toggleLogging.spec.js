var toggleLogging = require('../../../../lib/master/proto/toggleLogging');

describe(' - unit/master/proto/toggleLogging:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.log = true;
      this.toggleLogging = toggleLogging;
    };
  });

  it('should toggle logging', function () {
    // ARRANGE
    masterProcess = new MasterProcess();

    // ACT
    var actual1 = masterProcess.toggleLogging();
    var masterProcessLog1 = masterProcess.log;

    var actual2 = masterProcess.toggleLogging();
    var masterProcessLog2 = masterProcess.log;

    // ASSERT
    expect(actual1).toBeFalsy();
    expect(masterProcessLog1).toBeFalsy();

    expect(actual2).toBeTruthy();
    expect(masterProcessLog2).toBeTruthy();
  });
});
