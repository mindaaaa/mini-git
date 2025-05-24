const path = require('path');

function resolveToAbsolutePath(basePath = '') {
  return path.isAbsolute(basePath)
    ? basePath
    : path.resolve(process.cwd(), basePath);
}

module.exports = resolveToAbsolutePath;
