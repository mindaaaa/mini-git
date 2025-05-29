const fs = require('fs');
const { OBJECT_NOT_FOUND } = require('@domain/messages');
const { getObjectPath } = require('./path');

function readObject(hash, gitDir) {
  const { objectPath } = getObjectPath(gitDir, hash);

  if (!fs.existsSync(objectPath)) {
    console.error(OBJECT_NOT_FOUND(hash));
    return null;
  }

  const content = fs.readFileSync(objectPath, 'utf-8');
  return content;
}

module.exports = readObject;
