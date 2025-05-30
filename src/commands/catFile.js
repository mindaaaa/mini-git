const fs = require('fs');
const zlib = require('zlib');
const { getObjectPath } = require('@utils/path');

/**
 * Git 객체 내용을 출력합니다 (blob/tree/commit 지원).
 * @param {string} hash SHA-1 해시
 * @param {string} gitDir .git 디렉토리 경로
 */
function catFile(hash, gitDir) {
  const { objectPath } = getObjectPath(gitDir, hash);

  if (!fs.existsSync(objectPath)) {
    console.error(`객체를 찾을 수 없습니다: ${hash}`);
    return;
  }

  const compressed = fs.readFileSync(objectPath);
  const content = zlib.inflateSync(compressed);

  const nullIndex = content.indexOf(0);
  const header = content.slice(0, nullIndex).toString('utf-8');
  const type = header.split(' ')[0];
  const body = content.slice(nullIndex + 1);

  switch (type) {
    case 'blob':
    case 'commit':
      console.log(body.toString('utf-8'));
      break;
    case 'tree':
      parseTreeObject(body);
      break;
    default:
      console.error(`알 수 없는 객체 타입: ${type}`);
  }
}

function parseTreeObject(buffer) {
  let i = 0;
  while (i < buffer.length) {
    const modeEnd = buffer.indexOf(32, i); // space
    const mode = buffer.slice(i, modeEnd).toString();
    i = modeEnd + 1;

    const nameEnd = buffer.indexOf(0, i); // null byte
    const name = buffer.slice(i, nameEnd).toString();
    i = nameEnd + 1;

    const hash = buffer.slice(i, i + 20).toString('hex');
    i += 20;

    console.log(`${mode} ${name} ${hash}`);
  }
}

module.exports = catFile;
