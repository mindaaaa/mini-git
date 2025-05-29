const path = require('path');
const { HEAD_FILE } = require('@domain/enums');

function getHeadPath(gitDir) {
  return path.join(gitDir, HEAD_FILE);
}

module.exports = getHeadPath;
