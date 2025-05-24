const fs = require('fs');
const path = require('path');
const { setHeadRef } = require('../core/headUtils');

function checkoutBranch(gitDir, branch) {
  const branchPath = path.join(gitDir, 'refs', 'heads', branch);

  if (!fs.existsSync(branchPath)) {
    console.error(`fatal: 브랜치 '${branch}'는 존재하지 않습니다.`);
    return;
  }

  setHeadRef(gitDir, branch);
  console.log(`'${branch}' 브랜치로 전환되었습니다`);
}

module.exports = checkoutBranch;
