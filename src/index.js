const { init } = require('../../commands/init');

const [, , command] = process.argv;

if (command === 'init') {
  init();
}
