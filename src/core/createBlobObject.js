const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GIT_DIR = path.resolve('.mini-git');

function createBlobObject(content) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const header = `blob ${buffer.length}\0`;
  const store = Buffer.concat([Buffer.from(header), buffer]);

  const hash = crypto.createHash('sha1').update(store).digest('hex');

  const blobDir = hash.slice(0, 2);
  const blobFile = hash.slice(2);
  const objectDir = path.join(GIT_DIR, 'objects', blobDir);

  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir);
  }

  const objectPath = path.join(objectDir, blobFile);
  fs.writeFileSync(objectPath, store);

  return hash;
}

module.exports = createBlobObject;
