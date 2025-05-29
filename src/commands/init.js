'use strict';

const fs = require('fs');
const path = require('path');
const { GIT_DIR, DEFAULT_BRANCH } = require('../config');
const {
  OBJECTS_DIR,
  REFS_HEADS_DIR,
  HEAD_FILE,
  REF_PREFIX,
} = require('../domain/enums');
const getHeadRefPath = require('../utils/getHeadRefPath');
const resolveGitPath = require('../utils/resolveGitPath');

function init(gitDir = GIT_DIR) {
  const { absPath, relPath } = resolveGitPath(gitDir);

  if (fs.existsSync(absPath)) {
    console.error(`⚠️ 이미 ${relPath}의 깃 저장소가 초기화된 상태입니다.`);
    return;
  }

  fs.mkdirSync(absPath, { recursive: true });
  fs.mkdirSync(path.join(absPath, OBJECTS_DIR), { recursive: true });
  fs.mkdirSync(path.join(absPath, REFS_HEADS_DIR), { recursive: true });

  const headRefPath = getHeadRefPath(DEFAULT_BRANCH);
  const headContent = `${REF_PREFIX}${headRefPath}\n`;
  fs.writeFileSync(path.join(absPath, HEAD_FILE), headContent);

  console.log(`${relPath} 안의 빈 깃 저장소를 다시 초기화했습니다.`);
}

module.exports = init;
