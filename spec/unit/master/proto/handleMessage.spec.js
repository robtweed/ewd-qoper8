var handleMessage = require('../../../../lib/master/proto/handleMessage');

describe(' - unit/master/proto/handleMessage:', function () {
  var MasterProcess;
  var masterProcess;

  beforeAll(function () {
    MasterProcess = function () {
      this.addToQueue = jasmine.createSpy();
      this.handleMessage = handleMessage;
    };
  });

  it('should call #addToQueue with correct arguments', function () {
    // ARRANGE
    var message = {
      type: 'foo'
    };
    var callback = jasmine.createSpy();

    masterProcess = new MasterProcess();

    // ACT
    masterProcess.handleMessage(message, callback);

    // ASSERT
    expect(masterProcess.addToQueue).toHaveBeenCalledWith({
      type: 'foo',
      callback: callback
    });
  });
});
