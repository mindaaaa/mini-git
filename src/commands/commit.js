const fs = require('fs');
const path = require('path');
const createTreeHash = require('../core/createTreeHash');
const writeObject = require('../core/writeObject');

function commit(message, gitDir) {
  const INDEX_PATH = path.join(gitDir, 'index.json');
  const HEAD_PATH = path.join(gitDir, 'HEAD');
  const headRef = fs
    .readFileSync(HEAD_PATH, 'utf-8')
    .trim()
    .split('refs/heads/')[1];

  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`현재 브랜치 ${headRef}\n커밋할 사항 없음, 작업 폴더 깨끗함`);
    return;
  }
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

  const treeHash = createTreeHash(index, gitDir);
  const branchPath = path.join(gitDir, 'refs', 'heads', headRef);

  const parent = fs.existsSync(branchPath)
    ? fs.readFileSync(branchPath, 'utf-8').trim()
    : null;

  const author = 'minda <avalc@naver.com>';
  const timestamp = new Date().toISOString();

  const commitContent = `tree ${treeHash}
${parent ? `parent ${parent}\n` : ''}
author ${author} 
committer ${timestamp}

${message}
`;

  const commitHash = writeObject(commitContent, gitDir);

  fs.writeFileSync(branchPath, commitHash);
  console.log(`file changed, ${message}`);
}

module.exports = commit;
