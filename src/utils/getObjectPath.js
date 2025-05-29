const path = require('path');
const { OBJECTS_DIR } = require('../domain/enums');
const splitHash = require('./splitHash');

function getObjectPath(gitDir, hash) {
  const { dir, file } = splitHash(hash);
  const objectDir = path.join(gitDir, OBJECTS_DIR, dir);
  const objectPath = path.join(objectDir, file);

  return { objectDir, objectPath };
}

module.exports = getObjectPath;
