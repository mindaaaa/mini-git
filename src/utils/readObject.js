const fs = require('fs');
const path = require('path');
const { OBJECTS_DIR } = require('../domain/enums');
const { OBJECT_NOT_FOUND } = require('../domain/messages');
const splitHash = require('../utils/splitHash');

function readObject(hash, gitDir) {
  const { dir, file } = splitHash(hash);

  const objectPath = path.join(gitDir, OBJECTS_DIR, dir, file);

  if (!fs.existsSync(objectPath)) {
    console.error(OBJECT_NOT_FOUND(hash));
    return null;
  }

  const content = fs.readFileSync(objectPath, 'utf-8');
  return content;
}

module.exports = readObject;
