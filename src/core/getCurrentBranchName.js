const fs = require('fs');
const path = require('path');

function getCurrentBranchName(gitDir) {
  const headPath = path.join(gitDir, 'HEAD');
  const headContent = fs.readFileSync(headPath, 'utf-8').trim();

  if (headContent.startsWith('ref:')) {
    const refPath = headContent.split(' ')[1];
    const branchName = refPath.split('/').pop();
    return branchName;
  }

  return null;
}

module.exports = getCurrentBranchName;
