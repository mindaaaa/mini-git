const fs = require('fs');
const path = require('path');
const createTreeHash = require('@core/createTreeHash');
const writeGitObject = require('@core/writeGitObject');
const { getHeadRefPath, getHeadPath } = require('@utils/path');
const { AUTHOR_NAME, AUTHOR_EMAIL } = require('@config');
const { INDEX_FILE } = require('@domain/enums');
const { COMMIT_NO_CHANGES, COMMIT_SUCCESS } = require('@domain/messages');

function commit(message, gitDir) {
  const indexPath = path.join(gitDir, INDEX_FILE);
  const headPath = getHeadPath(gitDir);

  const headRef = fs
    .readFileSync(headPath, 'utf-8')
    .trim()
    .split('refs/heads/')[1];

  if (!fs.existsSync(indexPath)) {
    console.error(COMMIT_NO_CHANGES(headRef));
    return;
  }
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const treeHash = createTreeHash(index, gitDir);

  const branchPath = path.join(gitDir, getHeadRefPath(headRef));
  const parent = fs.existsSync(branchPath)
    ? fs.readFileSync(branchPath, 'utf-8').trim()
    : null;

  const author = `${AUTHOR_NAME} <${AUTHOR_EMAIL}>`;
  const timestamp = new Date().toISOString();

  const commitContent = `tree ${treeHash}
${parent ? `parent ${parent}\n` : ''}
author ${author} 
committer ${timestamp}

${message}
`;

  const commitHash = writeGitObject('commit', commitContent, gitDir);

  fs.writeFileSync(branchPath, commitHash);
  console.log(COMMIT_SUCCESS(message));
}

module.exports = commit;
