const path = require('path');

const REF_PREFIX = 'ref: ';
const HEAD_TYPES = {
  REF: 'ref',
  HASH: 'hash',
};
const REFS_HEADS_DIR = path.join('refs', 'heads');
const HEAD_FILE = 'HEAD';
const OBJECTS_DIR = 'objects';
const REFS_DIR = 'refs';
const HEADS_DIR = 'heads';
const INDEX_FILE = 'index.json';

function getBranchPath(gitDir, branch) {
  return path.join(gitDir, REFS_HEADS_DIR, branch);
}

module.exports = {
  REF_PREFIX,
  HEAD_TYPES,
  REFS_HEADS_DIR,
  HEAD_FILE,
  OBJECTS_DIR,
  REFS_DIR,
  HEADS_DIR,
  INDEX_FILE,
  getBranchPath,
};
