const fs = require('fs');
const path = require('path');

function readHead(gitDir) {
  const headPath = path.join(gitDir, 'HEAD');
  const content = fs.readFileSync(headPath, 'utf-8').trim();

  if (content.startsWith('ref:')) {
    const ref = content.slice(5); // 'ref: refs/heads/main' → 'refs/heads/main'
    return {
      type: 'ref',
      ref,
      fullPath: path.join(gitDir, ref),
    };
  }

  // detached HEAD 상태
  return {
    type: 'hash',
    hash: content,
  };
}

module.exports = readHead;
