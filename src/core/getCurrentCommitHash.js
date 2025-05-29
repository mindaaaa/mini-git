const fs = require('fs');
const readHead = require('../utils/readHead');

function getCurrentCommitHash(gitDir) {
  const head = readHead(gitDir);

  if (head.type === 'ref') {
    if (!fs.existsSync(head.fullPath)) {
      console.error(
        `fatal: HEAD가 가리키는 브랜치 ${head.ref}가 존재하지 않습니다`
      );
      return null;
    }
    return fs.readFileSync(head.fullPath, 'utf-8').trim();
  }
}

module.exports = getCurrentCommitHash;
