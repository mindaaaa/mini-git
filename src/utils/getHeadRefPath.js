const path = require('path');
const { DEFAULT_BRANCH } = require('../config');

function getHeadRefPath(branch = DEFAULT_BRANCH) {
  return path.join('refs', 'heads', branch);
}

module.exports = getHeadRefPath;
