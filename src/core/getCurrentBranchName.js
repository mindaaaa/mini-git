const fs = require('fs');
const path = require('path');
const { REF_PREFIX, HEAD_FILE } = require('../domain/enums');

function getCurrentBranchName(gitDir) {
  const headPath = path.join(gitDir, HEAD_FILE);
  const headContent = fs.readFileSync(headPath, 'utf-8').trim();

  if (headContent.startsWith(REF_PREFIX)) {
    const refPath = headContent.split(' ')[1];
    return path.basename(refPath);
  }

  return null;
}

module.exports = getCurrentBranchName;
