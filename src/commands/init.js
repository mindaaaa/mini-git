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
const { INIT_ALREADY_EXISTS, INIT_SUCCESS } = require('../domain/messages');

function init(gitDir = GIT_DIR) {
  const { absPath, relPath } = resolveGitPath(gitDir);

  if (fs.existsSync(absPath)) {
    console.error(INIT_ALREADY_EXISTS(relPath));
    return;
  }

  fs.mkdirSync(absPath, { recursive: true });
  fs.mkdirSync(path.join(absPath, OBJECTS_DIR), { recursive: true });
  fs.mkdirSync(path.join(absPath, REFS_HEADS_DIR), { recursive: true });

  const headRefPath = getHeadRefPath(DEFAULT_BRANCH);
  const headContent = `${REF_PREFIX}${headRefPath}\n`;
  fs.writeFileSync(path.join(absPath, HEAD_FILE), headContent);

  console.log(INIT_SUCCESS(relPath));
}

module.exports = init;
