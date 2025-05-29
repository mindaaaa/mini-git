'use strict';

const init = require('@commands/init');
const add = require('@commands/add');
const commit = require('@commands/commit');
const createBranch = require('@commands/branch');
const checkoutBranch = require('@commands/checkout');
const log = require('@commands/log');

const CommandStrategy = {
  init: {
    run: (_, gitDir) => {
      init(gitDir);
    },
  },

  add: {
    run: (args, gitDir) => {
      const filename = args[0];
      if (!filename) {
        console.log(
          '아무 것도 지정하지 않았으므로 아무 것도 추가하지 않습니다.'
        );
        return;
      }
      add(filename, gitDir);
    },
  },

  commit: {
    run: (args, gitDir) => {
      const message = args.join(' ').trim();
      if (!message) {
        console.error('⚠️ 커밋 메시지를 입력해주세요.');
        return;
      }
      commit(message, gitDir);
    },
  },

  branch: {
    run: (args, gitDir) => {
      const branch = args[0];
      if (!branch) {
        console.error('⚠️ 브랜치 이름을 입력해주세요.');
        return;
      }
      createBranch(gitDir, branch);
    },
  },

  checkout: {
    run: (args, gitDir) => {
      const branch = args[0];
      if (!branch) {
        console.error('fatal: 현재 위치가 만들 예정인 브랜치에 있습니다');
        return;
      }
      checkoutBranch(gitDir, branch);
    },
  },

  log: {
    run: (_, gitDir) => {
      log(gitDir);
    },
  },
};

module.exports = CommandStrategy;
