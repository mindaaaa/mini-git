const fs = require('fs');
const path = require('path');
const { REF_PREFIX, HEAD_TYPES } = require('@domain/enums');
const { getHeadPath } = require('@utils/path');

function readHead(gitDir) {
  const headPath = getHeadPath(gitDir);
  const content = fs.readFileSync(headPath, 'utf-8').trim();

  if (content.startsWith(REF_PREFIX)) {
    const ref = content.slice(5);
    return {
      type: HEAD_TYPES.REF,
      ref,
      fullPath: path.join(gitDir, ref),
    };
  }

  return {
    type: HEAD_TYPES.HASH,
    hash: content,
  };
}

module.exports = readHead;
