'use strict';

const path = require('path');
const moduleAlias = require('module-alias');

const ROOT = path.resolve(__dirname, '..', '..');

moduleAlias.addAliases({
  '@core': path.join(ROOT, 'src', 'core'),
  '@utils': path.join(ROOT, 'src', 'utils'),
  '@domain': path.join(ROOT, 'src', 'domain'),
  '@config': path.join(ROOT, 'src', 'config'),
  '@commands': path.join(ROOT, 'src', 'commands'),
  '@strategies': path.join(ROOT, 'src', 'strategies'),
});

module.exports = { ROOT };
