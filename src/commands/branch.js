const fs = require('fs');
const path = require('path');
const { getCurrentCommitHash } = require('../core/headUtils');

function createBranch(gitDir, branch) {
  const commitHash = getCurrentCommitHash(gitDir);
  if (!commitHash) {
    console.error(`fatal: 'HEAD'는 유효한 커밋이 아닙니다`);
    return;
  }

  const branchPath = path.join(gitDir, 'refs', 'heads', branch);

  if (fs.existsSync(branchPath)) {
    console.error(`fatal: '${branch}'이라는 이름의 브랜치가 이미 존재합니다`);
    return;
  }

  fs.writeFileSync(branchPath, `${commitHash}\n`);
  console.log(`'${branch}' 브랜치를 생성했습니다 (${commitHash})`);
}

module.exports = createBranch;
