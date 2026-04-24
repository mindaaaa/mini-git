'use strict';

require('./bootstrap');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const readObject = require('@utils/readObject');
const parseCommitObject = require('@utils/parseCommitObject');
const { readHead } = require('@utils/head');
const {
  HEAD_FILE,
  REFS_DIR,
  HEADS_DIR,
  INDEX_FILE,
} = require('@domain/enums');

function silentConsoleError(fn) {
  const orig = console.error;
  console.error = () => {};
  try {
    return fn();
  } finally {
    console.error = orig;
  }
}

function hashBlob(content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const header = Buffer.from(`blob ${buf.length}\0`);
  const store = Buffer.concat([header, buf]);
  return crypto.createHash('sha1').update(store).digest('hex');
}

function getHeadState(gitDir) {
  if (!fs.existsSync(path.join(gitDir, HEAD_FILE))) {
    return { exists: false };
  }
  const head = readHead(gitDir);
  if (head.type === 'ref') {
    const branch = head.ref ? head.ref.split('/').pop() : null;
    const hash =
      head.fullPath && fs.existsSync(head.fullPath)
        ? fs.readFileSync(head.fullPath, 'utf-8').trim()
        : null;
    return { exists: true, detached: false, branch, hash };
  }
  return { exists: true, detached: true, branch: null, hash: head.hash || null };
}

function listRefs(gitDir) {
  const headsDir = path.join(gitDir, REFS_DIR, HEADS_DIR);
  const tagsDir = path.join(gitDir, REFS_DIR, 'tags');
  const readRefDir = (dir) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).map((name) => ({
      name,
      hash: fs.readFileSync(path.join(dir, name), 'utf-8').trim(),
    }));
  };
  return {
    branches: readRefDir(headsDir),
    tags: readRefDir(tagsDir),
  };
}

function readIndex(gitDir) {
  const indexPath = path.join(gitDir, INDEX_FILE);
  if (!fs.existsSync(indexPath)) return [];
  try {
    const obj = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    return Object.entries(obj).map(([filePath, hash]) => ({
      path: filePath,
      hash,
    }));
  } catch {
    return [];
  }
}

function listWorkingTree(cwd, index) {
  if (!fs.existsSync(cwd)) return [];
  const indexMap = Object.fromEntries(index.map((e) => [e.path, e.hash]));
  const names = fs
    .readdirSync(cwd)
    .filter((n) => n !== '.mini-git' && n !== 'node_modules');
  const files = [];

  for (const name of names) {
    const full = path.join(cwd, name);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;
    const content = fs.readFileSync(full);
    const h = hashBlob(content);
    const indexed = indexMap[name];

    let status;
    if (indexed === undefined) status = '?';
    else if (indexed === h) status = 'A';
    else status = 'M';

    files.push({ path: name, status, hash: h });
  }

  for (const entry of index) {
    if (!files.find((f) => f.path === entry.path)) {
      files.push({ path: entry.path, status: 'D', hash: entry.hash });
    }
  }

  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

function buildGraph(gitDir, head, refs) {
  const roots = new Set();
  if (head && head.hash) roots.add(head.hash);
  for (const b of refs.branches) if (b.hash) roots.add(b.hash);
  for (const t of refs.tags) if (t.hash) roots.add(t.hash);

  const visited = new Set();
  const commits = [];

  silentConsoleError(() => {
    for (const start of roots) {
      let cursor = start;
      while (cursor && !visited.has(cursor)) {
        visited.add(cursor);
        const raw = readObject(cursor, gitDir);
        if (!raw) break;
        const parsed = parseCommitObject(raw);
        commits.push({
          hash: cursor,
          tree: parsed.tree || null,
          parent: parsed.parent || null,
          author: parsed.author || '',
          timestamp: parsed.timestamp || '',
          message: (parsed.message || '').trim(),
        });
        cursor = parsed.parent || null;
      }
    }
  });

  return commits;
}

function buildUIState(cwd) {
  const gitDir = path.join(cwd, '.mini-git');
  if (!fs.existsSync(gitDir)) {
    const empty = { branches: [], tags: [] };
    return {
      initialized: false,
      head: { exists: false },
      refs: empty,
      index: [],
      workingTree: listWorkingTree(cwd, []),
      graph: [],
    };
  }

  const head = getHeadState(gitDir);
  const refs = listRefs(gitDir);
  const index = readIndex(gitDir);
  const workingTree = listWorkingTree(cwd, index);
  const graph = buildGraph(gitDir, head, refs);

  return { initialized: true, head, refs, index, workingTree, graph };
}

module.exports = { buildUIState };
