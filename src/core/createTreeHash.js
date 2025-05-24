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
  // store = "tree 123\\0100644 file1.txt\\0abcd1234...\n100644 file2.txt\\0efgh5678..."

  return writeObject(store, gitDir);
}

module.exports = createTreeHash;
