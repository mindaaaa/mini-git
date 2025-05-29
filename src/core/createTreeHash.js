const writeGitObject = require('@core/writeGitObject');

function createTreeHash(index, gitDir) {
  const fileEntries = Object.entries(index).map(([filename, hash]) => {
    const mode = '100644';
    const entry = `${mode} ${filename}\0`;
    const hashBuffer = Buffer.from(hash, 'hex');
    return Buffer.concat([Buffer.from(entry), hashBuffer]);
  });

  const treeContent = Buffer.concat(fileEntries);
  return writeGitObject('tree', treeContent, gitDir);
}

module.exports = createTreeHash;
