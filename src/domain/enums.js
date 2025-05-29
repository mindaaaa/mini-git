const path = require('path');

const REF_PREFIX = 'ref: ';
const REFS_HEADS_DIR = path.join('refs', 'heads');
const HEAD_FILE = 'HEAD';
const OBJECTS_DIR = 'objects';

module.exports = {
  REF_PREFIX,
  HEAD_FILE,
  OBJECTS_DIR,
  REFS_HEADS_DIR,
};
