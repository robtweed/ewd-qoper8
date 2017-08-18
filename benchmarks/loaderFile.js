'use strict';

var workerFile = [
  '// ewd-qoper8 Worker File',
  '//',
  'var ewd_qoper8 = require("../");',
  'var qoper8 = new ewd_qoper8.workerProcess();',
  'qoper8.init();'
];

module.exports = workerFile;
