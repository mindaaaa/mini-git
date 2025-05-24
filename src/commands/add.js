const fs = require('fs');
const path = require('path');
const resolveToAbsolutePath = require('../utils/resolveToAbsolutePath');
const createBlobObject = require('../core/createBlobObject');
const addFileToIndex = require('../core/addFileToIndex');

function add(filename, gitDir) {
  const filePath = resolveToAbsolutePath(filename);

  if (!fs.existsSync(filePath)) {
    console.error(
      `fatal:  '${filename}'경로명세가 어떤 파일과도 일치하지 않습니다`
    );
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const hash = createBlobObject(content, gitDir);

  addFileToIndex(filename, hash, gitDir);
  console.log(`${filename}이 스테이징 되었습니다. (${hash})`);
}

module.exports = add;
