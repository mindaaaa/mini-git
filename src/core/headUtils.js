const fs = require('fs');
const path = require('path');

function readHead(gitDir) {
  const headPath = path.join(gitDir, 'HEAD');
  const headContent = fs.readFileSync(headPath, 'utf-8').trim();

  if (headContent.startsWith('ref: ')) {
    const refPath = headContent.slice(5);
    const fullRefPath = path.join(gitDir, refPath);
    return {
      type: 'ref',
      ref: refPath,
      fullPath: fullRefPath,
    };
  }

  return {
    type: 'detached',
    hash: headContent,
  };
}

function getCurrentCommitHash(gitDir) {}

function setHeadRef(gitDir, branch) {}

function setHeadDetached(gitDir, commitHash) {}

module.exports = {
  readHead,
  setHeadRef,
  setHeadDetached,
  getCurrentCommitHash,
};
