const init = require('../src/commands/init');
const add = require('../src/commands/add');
const commit = require('../src/commands/commit');
const resolveToAbsolutePath = require('../src/utils/resolveToAbsolutePath');

const [, , command, ...args] = process.argv;
const basePath = '.mini-git';
const gitDir = resolveToAbsolutePath(basePath);

switch (command) {
  case 'init': {
    init(basePath);
    break;
  }

  case 'add': {
    const filename = args[0];
    if (!filename) {
      console.log('아무 것도 지정하지 않았으므로 아무 것도 추가하지 않습니다.');
      return;
    }
    add(filename, gitDir);
    break;
  }

  case 'commit': {
    const message = args.join(' ').trim();
    if (!message) {
      console.error('⚠️ 커밋 메시지를 입력해주세요.');
      return;
    }
    commit(message, gitDir);
    break;
  }

  default: {
    console.error(`알 수 없는 명령어: ${command}`);
  }
}
