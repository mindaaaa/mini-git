const getCurrentCommitHash = require('../core/getCurrentCommitHash');
const readObject = require('../utils/readObject');
const parseCommitObject = require('../utils/parseCommitObject');
const formatGitDate = require('../utils/formatGitDate');
const getCurrentBranchName = require('../core/getCurrentBranchName');

function log(gitDir) {
  const branchName = getCurrentBranchName(gitDir);
  const headHash = getCurrentCommitHash(gitDir);
  let currentHash = headHash;

  while (currentHash) {
    const raw = readObject(currentHash, gitDir);
    const parsed = parseCommitObject(raw);

    const headInfo =
      currentHash === headHash && branchName ? ` (HEAD -> ${branchName})` : '';

    console.log(`commit ${currentHash}${headInfo}`);
    console.log(`Author: ${parsed.author}`);
    console.log(`Date:   ${formatGitDate(parsed.timestamp)}`);
    console.log(`\n    ${parsed.message}\n`);

    currentHash = parsed.parent;
  }
}

module.exports = log;

// Date:   Thu May 29 09:51:18 2025 +0900
