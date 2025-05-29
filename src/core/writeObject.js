const crypto = require('crypto');
const fs = require('fs');
const getObjectPath = require('../utils/getObjectPath');

// TODO: createTreeHash와 writeObject를 분리해야하는가 고민하기
function writeObject(content, gitDir) {
  const hash = crypto.createHash('sha1').update(content).digest('hex');
  const { objectDir, objectPath } = getObjectPath(gitDir, hash);

  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir, { recursive: true });
  }

  fs.writeFileSync(objectPath, content);
  return hash;
}

module.exports = writeObject;
