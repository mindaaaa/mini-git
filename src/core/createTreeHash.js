const path = require('path');
const writeObject = require('./writeObject');

function createTreeHash(index, gitDir) {
  const fileEntries = Object.entries(index).map(([filename, hash]) => {
    return `100644 ${filename}\\0${hash}`;
  });

  const treeContent = fileEntries.join('\n');

  const buffer = Buffer.from(treeContent, 'utf-8');
  const treeHeader = `tree ${buffer.length}\\0`;

  const store = Buffer.concat([Buffer.from(treeHeader), buffer]);
  return writeObject(store, gitDir);
}

module.exports = createTreeHash;
