const init = require('../src/commands/init');
const add = require('../src/commands/add');

const [, , command, filename] = process.argv;

if (command === 'init') {
  init();
}

if (command === 'add') {
  if (!filename) {
    console.log('아무 것도 지정하지 않았으므로 아무 것도 추가하지 않습니다.');
  }
  add(filename);
}
