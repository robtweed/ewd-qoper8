var rewire = require('rewire');
var createWorkerProcessModule = rewire('../../../../lib/master/proto/createWorkerProcessModule');

describe(' - unit/master/proto/createWorkerProcessModule:', function () {
  var MasterProcess;
  var masterProcess;
  var fsMock;
  var revert;

  beforeAll(function () {
    fsMock = {
      writeFileSync: jasmine.createSpy()
    };

    MasterProcess = function () {
      this.log = true;
      this.worker = {
        loaderFilePath: 'test.js',
        loaderText: [
          'var foo = 100;',
          'var bar = 200;'
        ]
      };
      this.createWorkerProcessModule = createWorkerProcessModule;
    };
  });

  beforeEach(function () {
    revert = createWorkerProcessModule.__set__('fs', fsMock);
    masterProcess = new MasterProcess();
  });

  afterEach(function () {
    revert();
    masterProcess = null;
  });

  it('should create worker process module', function () {
    // ACT
    masterProcess.createWorkerProcessModule();

    // ASSERT
    expect(fsMock.writeFileSync).toHaveBeenCalledWith('test.js', 'var foo = 100;\nvar bar = 200;\n');
  });
});
