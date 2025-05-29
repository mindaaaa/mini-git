'use strict';
require('module-alias/register');

const { resolveFilePath } = require('@utils/path');
const CommandStrategy = require('@strategies/CommandStrategy');

const [, , command, ...args] = process.argv;
const BASE_PATH = '.mini-git';
const gitDir = resolveFilePath(BASE_PATH);

const strategy = CommandStrategy[command];

if (!strategy) {
  console.error(`mini-git: '${command}'은(는) 깃 명령이 아닙니다.`);
  console.log(`사용 가능한 명령어: ${Object.keys(CommandStrategy).join(', ')}`);
}

strategy.run(args, gitDir);
