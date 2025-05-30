const fs = require('fs');
const path = require('path');
const { getCurrentCommitHash } = require('@core/headUtils');
const {
  INVALID_HEAD,
  BRANCH_ALREADY_EXISTS,
  BRANCH_CREATED,
} = require('@domain/messages');
const { getBranchPath } = require('@domain/enums');

function createBranch(gitDir, branch) {
  const commitHash = getCurrentCommitHash(gitDir);
  if (!commitHash) {
    console.error(INVALID_HEAD);
    return;
  }

  const branchPath = getBranchPath(gitDir, branch);
  fs.mkdirSync(path.dirname(branchPath), { recursive: true });

  if (fs.existsSync(branchPath)) {
    console.error(BRANCH_ALREADY_EXISTS(branch));
    return;
  }

  fs.writeFileSync(branchPath, `${commitHash}\n`);
  console.log(BRANCH_CREATED(branch, commitHash));
}

module.exports = createBranch;
