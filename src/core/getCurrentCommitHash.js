const fs = require('fs');
const { readHead } = require('@utils/head');
const { INVALID_HEAD_REF } = require('@domain/messages');

function getCurrentCommitHash(gitDir) {
  const head = readHead(gitDir);

  if (head.type === 'ref') {
    if (!fs.existsSync(head.fullPath)) {
      console.error(INVALID_HEAD_REF(head.ref));
      return null;
    }
    return fs.readFileSync(head.fullPath, 'utf-8').trim();
  }
}

module.exports = getCurrentCommitHash;
