const path = require('path');

function resolveGitPath(gitDir) {
  const absPath = path.resolve(gitDir);
  const relPath = path.relative(process.cwd(), absPath) || '.';

  return { absPath, relPath };
}

module.exports = resolveGitPath;
