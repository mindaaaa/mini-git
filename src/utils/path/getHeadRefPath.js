const path = require('path');
const { DEFAULT_BRANCH } = require('@config');
const { REFS_DIR, HEADS_DIR } = require('@domain/enums');

function getHeadRefPath(branch = DEFAULT_BRANCH) {
  return path.join(REFS_DIR, HEADS_DIR, branch);
}

module.exports = getHeadRefPath;
