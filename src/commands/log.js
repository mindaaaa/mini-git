const getCurrentCommitHash = require('../core/getCurrentCommitHash');
const readObject = require('../utils/readObject');
const parseCommitObject = require('../utils/parseCommitObject');

function log(gitDir) {
  let currentHash = getCurrentCommitHash(gitDir);

  while (currentHash) {
    const raw = readObject(currentHash, gitDir);
    const parsed = parseCommitObject(raw);

    console.log(`commit ${currentHash}`);
    console.log(`Author: ${parsed.author}`);
    console.log(`Date:   ${parsed.timestamp}`);
    console.log(`\n    ${parsed.message}\n`);

    currentHash = parsed.parent;
  }
}

module.exports = log;
