const fs = require('fs');
const path = require('path');

const GIT_DIR = path.resolve('.mini-git');
const INDEX_PATH = path.join(GIT_DIR, 'index.json');

// {
//   "hello.txt": "e69de2..."
// }
function addFileToIndex(fileName, hash) {
  const index = fs.existsSync(INDEX_PATH)
    ? JSON.parse(fs.readFileSync(INDEX_PATH), 'utf-8')
    : {};

  index[fileName] = hash;

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

module.exports = addFileToIndex;
