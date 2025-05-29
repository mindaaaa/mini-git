const crypto = require('crypto');
const fs = require('fs');
const { getObjectPath } = require('@utils/path');

/**
 * Git 객체를 생성하고 저장합니다.
 * @param {'blob' | 'tree' | 'commit'} type
 * @param {Buffer|string} content
 * @param {string} gitDir
 * @returns {string} SHA-1 해시
 */

function writeGitObject(type, content, gitDir) {
  const buffer = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content, 'utf-8');
  const header = `${type} ${buffer.length}\0`;
  const headerBuffer = Buffer.from(header, 'utf-8');
  const store = Buffer.concat([headerBuffer, buffer]);

  const hash = crypto.createHash('sha1').update(store).digest('hex');
  const { objectDir, objectPath } = getObjectPath(gitDir, hash);

  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir, { recursive: true });
  }

  fs.writeFileSync(objectPath, store);
  return hash;
}

module.exports = writeGitObject;
