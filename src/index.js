const init = require('../src/commands/init');
const add = require('../src/commands/add');

const [, , command] = process.argv;

if (command === 'init') {
  init();
}

if (command === 'add') {
  add();
}
