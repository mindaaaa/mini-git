import fs from 'fs';
import path from 'path';

const GIT_DIR = path.resolve('.mini-git');

export function init() {
  if (fs.existsSync(GIT_DIR)) {
    console.log('⚠️ 이미 .mini-git의 깃 저장소가 초기화된 상태입니다.');
    return;
  }

  fs.mkdirSync(GIT_DIR, { recursive: true });
  fs.mkdirSync(path.join(GIT_DIR, 'objects'), { recursive: true });
  fs.mkdirSync(path.join(GIT_DIR, 'refs', 'heads'), { recursive: true });

  fs.writeFileSync(path.join(GIT_DIR, 'HEAD'), 'ref: refs/heads/main\n');
  console.log('.mini-git 안의 빈 깃 저장소를 다시 초기화했습니다.');
}
