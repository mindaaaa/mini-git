const fs = require('fs');
const path = require('path');

function readObject(hash, gitDir) {
  const dir = hash.slice(0, 2);
  const file = hash.slice(2);
  const objectPath = path.join(gitDir, 'objects', dir, file);

  if (!fs.existsSync(objectPath)) {
    console.error(`fatal: '${hash}'는 유효하지 않은 객체입니다.`);
    return null;
  }

  const content = fs.readFileSync(objectPath);
  return content.toString('utf-8');
}

module.exports = readObject;
