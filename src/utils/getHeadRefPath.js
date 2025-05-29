const path = require('path');
const { DEFAULT_BRANCH } = require('../config');

function getHeadRefPath(branch = DEFAULT_BRANCH) {
  return path.join('refs', 'heads', branch);
}

module.exports = getHeadRefPath;

// hash 만드는거 로직 뺴기
// 아예 PATH들 다 묶어서 export하기
