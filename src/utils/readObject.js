const fs = require('fs');
const zlib = require('zlib');
const { OBJECT_NOT_FOUND } = require('@domain/messages');
const { getObjectPath } = require('./path');

function readObject(hash, gitDir) {
  const { objectPath } = getObjectPath(gitDir, hash);

  if (!fs.existsSync(objectPath)) {
    console.error(OBJECT_NOT_FOUND(hash));
    return null;
  }

  const compressed = fs.readFileSync(objectPath);
  return zlib.inflateSync(compressed);
}

module.exports = readObject;
