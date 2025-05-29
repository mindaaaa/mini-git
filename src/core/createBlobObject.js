const writeGitObject = require('@core/writeGitObject');

function createBlobObject(content, gitDir) {
  return writeGitObject('blob', content, gitDir);
}

module.exports = createBlobObject;
