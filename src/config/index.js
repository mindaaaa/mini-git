require('dotenv').config();

module.exports = {
  GIT_DIR: process.env.GIT_DIR || '.mini-git',
  DEFAULT_BRANCH: process.env.DEFAULT_BRANCH || 'main',
  AUTHOR_NAME: process.env.AUTHOR_NAME || 'anonymous',
  AUTHOR_EMAIL: process.env.AUTHOR_EMAIL || 'anonymous@example.com',
};
