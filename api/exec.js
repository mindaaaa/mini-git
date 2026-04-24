'use strict';

require('./_lib/bootstrap');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const runner = require('./_lib/runner');
const snapshot = require('./_lib/snapshot');
const state = require('./_lib/state');

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function ensureSessionDir() {
  const id = crypto.randomBytes(8).toString('hex');
  const dir = path.join(os.tmpdir(), `minigit-${id}`);
  fs.mkdirSync(dir, { recursive: true });
  /* normalize symlinks so process.cwd() matches the path we constructed */
  return fs.realpathSync(dir);
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}

function writeIncomingFiles(cwd, files) {
  if (!files || typeof files !== 'object') return;
  for (const [rel, content] of Object.entries(files)) {
    if (rel.includes('..') || path.isAbsolute(rel)) continue;
    if (rel.startsWith('.mini-git')) continue;
    const full = path.join(cwd, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    if (typeof content === 'string') {
      fs.writeFileSync(full, content, 'utf-8');
    } else if (content && typeof content === 'object' && typeof content.base64 === 'string') {
      fs.writeFileSync(full, Buffer.from(content.base64, 'base64'));
    }
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: `Invalid JSON: ${err.message}` }));
    return;
  }

  const { command, args, snapshot: incomingSnapshot, files } = body || {};
  if (typeof command !== 'string' || !command) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: 'command is required' }));
    return;
  }

  const cwd = ensureSessionDir();
  try {
    if (incomingSnapshot) snapshot.unpack(incomingSnapshot, cwd);
    writeIncomingFiles(cwd, files);

    const result = runner.run(command, Array.isArray(args) ? args : [], cwd);
    const ui = state.buildUIState(cwd);
    const outSnapshot = snapshot.pack(cwd);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: result.ok,
        stdout: result.stdout,
        stderr: result.stderr,
        snapshot: outSnapshot,
        state: ui,
      })
    );
  } catch (err) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        ok: false,
        error: err.message || String(err),
      })
    );
  } finally {
    cleanup(cwd);
  }
};
