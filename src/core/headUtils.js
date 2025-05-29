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

function getCurrentCommitHash(gitDir) {
  const head = readHead(gitDir);

  // TODO: 얼리리턴으로 리팩토링
  if (head.type === 'ref') {
    if (!fs.existsSync(head.fullPath)) {
      console.error(
        `fatal: HEAD가 가리키는 브랜치 ${head.ref}가 존재하지 않습니다`
      );
      return null;
    }
    return fs.readFileSync(head.fullPath, 'utf-8').trim();
  }
  return head.hash;
}

function setHeadRef(gitDir, branch) {
  const headPath = path.join(gitDir, 'HEAD');
  fs.writeFileSync(headPath, `ref: refs/heads/${branch}\n`);
}

function setHeadDetached(gitDir, commitHash) {
  const headPath = path.join(gitDir, 'HEAD');
  fs.writeFileSync(headPath, `${commitHash}\n`);
}

module.exports = {
  readHead,
  setHeadRef,
  setHeadDetached,
  getCurrentCommitHash,
};
