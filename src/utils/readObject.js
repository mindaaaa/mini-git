const fs = require('fs');
const zlib = require('zlib');
const { OBJECT_NOT_FOUND } = require('@domain/messages');
const { getObjectPath } = require('./path');

/**
 * 주어진 해시를 기반으로 Git 객체 파일을 읽고, 압축을 해제하여 원본 데이터를 반환합니다.
 *
 * @param {string} hash - Git 객체의 SHA-1 해시
 * @param {string} gitDir - Git 저장소 디렉토리(기본 값은 `.mini-git`, 테스트 시 외부에서 주입 가능)
 * @returns {Buffer|null} 압축 해제된 Git 객체 데이터. 파일이 없을 경우 null 반환.
 */

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
