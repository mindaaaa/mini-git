'use strict';

const fs = require('fs');
const path = require('path');

function init(gitDir) {
  if (fs.existsSync(gitDir)) {
    console.error('⚠️ 이미 .mini-git의 깃 저장소가 초기화된 상태입니다.');
    return;
  }

  fs.mkdirSync(gitDir, { recursive: true });
  fs.mkdirSync(path.join(gitDir, 'objects'), { recursive: true });
  fs.mkdirSync(path.join(gitDir, 'refs', 'heads'), { recursive: true });

  fs.writeFileSync(path.join(gitDir, 'HEAD'), 'ref: refs/heads/main\n');
  console.log('.mini-git 안의 빈 깃 저장소를 다시 초기화했습니다.');
}

// TODO: 매직 리터럴은 환경변수와 enum으로 뺴기
module.exports = init;
