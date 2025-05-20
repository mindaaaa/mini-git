const fs = require('fs');
const path = require('path');
const createTreeHash = require('../core/createTreeHash');
const writeObject = require('../core/writeObject');

const GIT_DIR = path.resolve('.mini-git');
const INDEX_PATH = path.join(GIT_DIR, 'index.json');
const HEAD_PATH = path.join(GIT_DIR, 'HEAD');

function commit(message) {
  const headRef = fs
    .readFileSync(HEAD_PATH, 'utf-8')
    .trim()
    .split('refs/heads/')[1];

  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`현재 브랜치 ${headRef}\n커밋할 사항 없음, 작업 폴더 깨끗함`);
    return;
  }
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

  const treeHash = createTreeHash(index);
  const branchPath = path.join(GIT_DIR, 'refs', 'heads', headRef);

  const parent = fs.existsSync(branchPath)
    ? fs.readFileSync(branchPath, 'utf-8').trim()
    : null;

  const author = 'minda <avalc@naver.com>';
  const timestamp = new Date().toISOString();

  const commitContent = `tree ${treeHash}
${parent ? `parent ${parent}\n` : ''}
author ${author} ${timestamp}
committer ${author} ${timestamp}

${message}
`;

  const commitHash = writeObject(commitContent);

  fs.writeFileSync(branchPath, commitHash);
  console.log(`file changed, ${message}`);
}

module.exports = commit;
