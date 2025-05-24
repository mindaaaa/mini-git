const fs = require('fs');
const path = require('path');

// {
//   "hello.txt": "e69de2..."
// }
function addFileToIndex(fileName, hash, gitDir) {
  const INDEX_PATH = path.join(gitDir, 'index.json');

  const index = fs.existsSync(INDEX_PATH)
    ? JSON.parse(fs.readFileSync(INDEX_PATH), 'utf-8')
    : {};

  index[fileName] = hash;

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

module.exports = addFileToIndex;
