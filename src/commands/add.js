'use strict';

const fs = require('fs');
const { resolveFilePath } = require('@utils/path');
const createBlobObject = require('@core/createBlobObject');
const addFileToIndex = require('@core/addFileToIndex');
const { FILE_NOT_FOUND, FILE_ADDED } = require('@domain/messages');

function add(filename, gitDir) {
  const filePath = resolveFilePath(filename);

  if (!fs.existsSync(filePath)) {
    console.error(FILE_NOT_FOUND(filename));
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const hash = createBlobObject(content, gitDir);

  addFileToIndex(filename, hash, gitDir);
  console.log(FILE_ADDED(filename, hash));
}

module.exports = add;
