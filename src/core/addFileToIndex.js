const fs = require('fs');
const path = require('path');
const { INDEX_FILE } = require('../domain/enums');

function addFileToIndex(fileName, hash, gitDir) {
  const INDEX_PATH = path.join(gitDir, INDEX_FILE);

  const index = fs.existsSync(INDEX_PATH)
    ? JSON.parse(fs.readFileSync(INDEX_PATH), 'utf-8')
    : {};

  index[fileName] = hash;

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

module.exports = addFileToIndex;
