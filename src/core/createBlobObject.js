const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GIT_DIR = path.resolve('.mini-git');

function createBlobObject(content) {
  const blobData = `blob ${content.length}\0{content}`;
  const hash = crypto.createHash('sha1').update(blobData).digest('hex');

  const blobDir = hash.slice(0, 2);
  const blobFile = hash.slice(2);
  const objectDir = path.join(GIT_DIR, 'objects', blobDir);

  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir);
  }

  const objectPath = path.join(objectDir, blobFile);
  fs.writeFileSync(objectPath, blobData);

  return hash;
}

module.exports = createBlobObject;
