const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function writeObject(content, gitDir) {
  const hash = crypto.createHash('sha1').update(content).digest('hex');
  const dir = hash.slice(0, 2);
  const filename = hash.slice(2);

  const objectDir = path.join(gitDir, 'objects', dir);
  const objectPath = path.join(objectDir, filename);

  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir, { recursive: true });
  }

  fs.writeFileSync(objectPath, content);
  return hash;
}

module.exports = writeObject;
