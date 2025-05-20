const init = require('../src/commands/init');
const add = require('../src/commands/add');
const commit = require('../src/commands/commit');

const [, , command, ...args] = process.argv;

if (command === 'init') {
  init();
}

if (command === 'add') {
  const filename = args[0];
  if (!filename) {
    console.log('아무 것도 지정하지 않았으므로 아무 것도 추가하지 않습니다.');
  }
  add(filename, { basePath: '.mini-git' });
}

if (command === 'commit') {
  const message = args.join(' ').trim();
  if (!message) {
    console.error('⚠️ 커밋 메시지를 입력해주세요.');
    return;
  }
  commit(message);
}
