const fs = require('fs');
const path = require('path');
const { HEAD_FILE } = require('@domain/enums');

function setHeadRef(gitDir, branch) {
  const headPath = path.join(gitDir, HEAD_FILE);
  fs.writeFileSync(headPath, `ref: refs/heads/${branch}\n`);
}

module.exports = setHeadRef;
