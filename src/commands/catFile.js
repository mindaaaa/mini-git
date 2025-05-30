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
    console.error(`fatal: 객체를 찾을 수 없습니다: ${hash}`);
    return;
  }

  const content = decompress(fs.readFileSync(objectPath));
  const { type, body } = parseGitObject(content);

  const handler = GitObjectPrinter[type];
  if (!handler) {
    console.error(`fatal: 알 수 없는 객체 타입: '${type}'`);
    return;
  }

  handler(body);
}

function decompress(buffer) {
  return zlib.inflateSync(buffer);
}

function parseGitObject(buffer) {
  const nullIndex = buffer.indexOf(0);
  const header = buffer.slice(0, nullIndex).toString('utf-8');
  const type = header.split(' ')[0];
  const body = buffer.slice(nullIndex + 1);
  return { type, body };
}

const GitObjectPrinter = {
  blob: (body) => console.log(body.toString('utf-8')),
  commit: (body) => console.log(body.toString('utf-8')),
  tree: (body) => {
    let i = 0;
    while (i < body.length) {
      const modeEnd = body.indexOf(32, i);
      const mode = body.slice(i, modeEnd).toString();
      i = modeEnd + 1;

      const nameEnd = body.indexOf(0, i);
      const name = body.slice(i, nameEnd).toString();
      i = nameEnd + 1;

      const hash = body.slice(i, i + 20).toString('hex');
      i += 20;

      console.log(`${mode} ${name} ${hash}`);
    }
  },
};

module.exports = catFile;
