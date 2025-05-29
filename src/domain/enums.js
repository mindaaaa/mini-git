const path = require('path');

const REF_PREFIX = 'ref: ';
const REFS_HEADS_DIR = path.join('refs', 'heads');
const HEAD_FILE = 'HEAD';
const OBJECTS_DIR = 'objects';
const REFS_DIR = 'refs';
const HEADS_DIR = 'heads';

function getBranchPath(gitDir, branch) {
  return path.join(gitDir, REFS_HEADS_DIR, branch);
}

module.exports = {
  REF_PREFIX,
  HEAD_FILE,
  OBJECTS_DIR,
  REFS_HEADS_DIR,
  REFS_DIR,
  HEADS_DIR,
  getBranchPath,
};
