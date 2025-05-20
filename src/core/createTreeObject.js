const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const writeObject = require('./writeObject');

const GIT_DIR = path.resolve('.mini-git');

// index: { "file1.txt": "abcd1234...", "file2.txt": "efgh5678..." }
function createTreeObject(index) {
  // Object.entries(index) => [["file1.txt", "abcd1234..."], ["file2.txt", "efgh5678..."]]
  const fileEntries = Object.entries(index).map(([filename, hash]) => {
    return `100644 ${filename}\\0${hash}`;
  });

  // fileEntries = [
  //   "100644 file1.txt\\0abcd1234...",
  //   "100644 file2.txt\\0efgh5678..."
  // ]
  const treeContent = fileEntries.join('\n');
  // 100644 file1.txt\0abcd1234...
  // 100644 file2.txt\0efgh5678...

  const buffer = Buffer.from(treeContent, 'utf-8');
  const treeHeader = `tree ${buffer.length}\\0`;
  // "tree 123\\0" (예시로 123은 실제 길이)

  const store = Buffer.concat([Buffer.from(treeHeader), buffer]);
  // store = "tree 123\\0100644 file1.txt\\0abcd1234...\n100644 file2.txt\\0efgh5678..."

  return writeObject(store);
}

module.exports = createTreeObject;
