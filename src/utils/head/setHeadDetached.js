const fs = require('fs');
const path = require('path');
const { HEAD_FILE } = require('@domain/enums');

function setHeadDetached(gitDir, commitHash) {
  const headPath = path.join(gitDir, HEAD_FILE);
  fs.writeFileSync(headPath, `${commitHash}\n`);
}

module.exports = setHeadDetached;
