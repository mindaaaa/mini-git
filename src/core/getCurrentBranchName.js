const fs = require('fs');
const path = require('path');
const { REF_PREFIX, HEAD_FILE } = require('../domain/enums');
const getHeadPath = require('../utils/getHeadPath');

function getCurrentBranchName(gitDir) {
  const headPath = getHeadPath(gitDir);
  const headContent = fs.readFileSync(headPath, 'utf-8').trim();

  if (headContent.startsWith(REF_PREFIX)) {
    const refPath = headContent.split(' ')[1];
    return path.basename(refPath);
  }

  return null;
}

module.exports = getCurrentBranchName;
