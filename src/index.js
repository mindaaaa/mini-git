const init = require('../src/commands/init');
const add = require('../src/commands/add');
const commit = require('../src/commands/commit');
const createBranch = require('../src/commands/branch');
const checkoutBranch = require('../src/commands/checkout');
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
    console.error(`mini-git: '${command}'은(는) 깃 명령이 아닙니다.`);
  }
}
