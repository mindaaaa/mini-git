const fs = require('fs');
const path = require('path');
const init = require('../commands/init.js');

const GIT_DIR = path.resolve('.mini-git');

describe('init()', () => {
  afterEach(() => {
    if (fs.existsSync(GIT_DIR)) {
      fs.rmSync(GIT_DIR, { recursive: true });
    }
  });

  test('.mini-git 폴더와 HEAD 파일을 생성한다.', () => {
    init();

    expect(fs.existsSync(GIT_DIR)).toBe(true);
    expect(fs.existsSync(path.join(GIT_DIR, 'objects'))).toBe(true);
    expect(fs.existsSync(path.join(GIT_DIR, 'refs', 'heads'))).toBe(true);
    expect(fs.existsSync(path.join(GIT_DIR, 'HEAD'))).toBe(true);

    const headContent = fs.readFileSync(path.join(GIT_DIR, 'HEAD'), 'utf-8');
    expect(headContent).toBe('ref: refs/heads/main\n');
  });
});
