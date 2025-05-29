const fs = require('fs');
const path = require('path');
const { REF_PREFIX, HEAD_FILE, HEAD_TYPES } = require('../domain/enums');
const { INVALID_HEAD_REF } = require('../domain/messages');
const getHeadPath = require('../utils/getHeadPath');

function readHead(gitDir) {
  const headPath = getHeadPath(gitDir);
  const headContent = fs.readFileSync(headPath, 'utf-8').trim();

  if (headContent.startsWith(REF_PREFIX)) {
    const refPath = headContent.slice(5);
    const fullRefPath = path.join(gitDir, refPath);
    return {
      type: HEAD_TYPES.REF,
      ref: refPath,
      fullPath: fullRefPath,
    };
  }

  return {
    type: HEAD_TYPES.REF,
    hash: headContent,
  };
}

function getCurrentCommitHash(gitDir) {
  const head = readHead(gitDir);

  if (head.type === HEAD_TYPES.DETACHED) {
    return head.hash;
  }

  if (!fs.existsSync(head.fullPath)) {
    console.error(INVALID_HEAD_REF(head.ref));
    return null;
  }

  return fs.readFileSync(head.fullPath, 'utf-8').trim();
}

function setHeadRef(gitDir, branch) {
  const headPath = path.join(gitDir, HEAD_FILE);
  fs.writeFileSync(headPath, `ref: refs/heads/${branch}\n`);
}

function setHeadDetached(gitDir, commitHash) {
  const headPath = path.join(gitDir, HEAD_FILE);
  fs.writeFileSync(headPath, `${commitHash}\n`);
}

module.exports = {
  readHead,
  setHeadRef,
  setHeadDetached,
  getCurrentCommitHash,
};
