import { init } from './commands/init.js';

const [, , command] = process.argv;

if (command === 'init') {
  init();
}
