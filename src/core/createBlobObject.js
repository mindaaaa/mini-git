const fs = require('fs');
const crypto = require('crypto');
const getObjectPath = require('../utils/getObjectPath');

function createBlobObject(content, gitDir) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const header = `blob ${buffer.length}\0`;
  const store = Buffer.concat([Buffer.from(header), buffer]);

  const hash = crypto.createHash('sha1').update(store).digest('hex');
  const { objectDir, objectPath } = getObjectPath(gitDir, hash);

  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir);
  }

  fs.writeFileSync(objectPath, store);
  return hash;
}

module.exports = createBlobObject;
