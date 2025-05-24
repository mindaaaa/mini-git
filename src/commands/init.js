const fs = require('fs');
const path = require('path');
const resolveToAbsolutePath = require('../utils/resolveToAbsolutePath');

function init(basePath = 'mini-git') {
  const gitDir = resolveToAbsolutePath(basePath);

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

module.exports = init;
