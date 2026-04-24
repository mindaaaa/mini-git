'use strict';

const fs = require('fs');
const path = require('path');

function walk(root, rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  const stat = fs.statSync(full);
  if (stat.isFile()) return [rel];
  if (stat.isDirectory()) {
    return fs
      .readdirSync(full)
      .flatMap((child) => walk(root, path.join(rel, child)));
  }
  return [];
}

function pack(cwd) {
  const result = {};
  if (!fs.existsSync(cwd)) return result;

  for (const entry of fs.readdirSync(cwd)) {
    const full = path.join(cwd, entry);
    const stat = fs.statSync(full);
    if (stat.isFile()) {
      result[entry] = fs.readFileSync(full).toString('base64');
    } else if (stat.isDirectory()) {
      for (const rel of walk(cwd, entry)) {
        result[rel] = fs.readFileSync(path.join(cwd, rel)).toString('base64');
      }
    }
  }
  return result;
}

function unpack(snapshot, cwd) {
  if (!snapshot || typeof snapshot !== 'object') return;
  fs.mkdirSync(cwd, { recursive: true });
  for (const [rel, b64] of Object.entries(snapshot)) {
    if (typeof b64 !== 'string') continue;
    const full = path.join(cwd, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, Buffer.from(b64, 'base64'));
  }
  ensureGitDirs(cwd);
}

/**
 * Git requires certain subdirectories to exist even when empty.
 * Snapshots only carry files, so we materialize these after unpack.
 */
function ensureGitDirs(cwd) {
  const gitDir = path.join(cwd, '.mini-git');
  if (!fs.existsSync(gitDir)) return;
  for (const sub of ['objects', path.join('refs', 'heads'), path.join('refs', 'tags')]) {
    fs.mkdirSync(path.join(gitDir, sub), { recursive: true });
  }
}

module.exports = { pack, unpack, ensureGitDirs };
