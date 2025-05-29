const path = require('path');

function resolveFilePath(basePath = '') {
  return path.isAbsolute(basePath)
    ? basePath
    : path.resolve(process.cwd(), basePath);
}

module.exports = resolveFilePath;
