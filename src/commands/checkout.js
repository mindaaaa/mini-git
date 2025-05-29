const fs = require('fs');
const { setHeadRef } = require('../core/headUtils');
const { BRANCH_NOT_FOUND, CHECKOUT_SUCCESS } = require('../domain/messages');
const { getBranchPath } = require('../domain/enums');

function checkoutBranch(gitDir, branch) {
  const branchPath = getBranchPath(gitDir, branch);

  if (!fs.existsSync(branchPath)) {
    console.error(BRANCH_NOT_FOUND(branch));
    return;
  }

  setHeadRef(gitDir, branch);
  console.log(CHECKOUT_SUCCESS(branch));
}

module.exports = checkoutBranch;
