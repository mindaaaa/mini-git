#!/usr/bin/env node
'use strict';

/**
 * Lightweight dev server that mirrors Vercel's routing:
 *   - GET /*          → static file from public/
 *   - POST /api/exec  → api/exec.js handler
 * Use `node scripts/dev-server.js` for local end-to-end testing without vercel CLI.
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3001);

const execHandler = require(path.join(ROOT, 'api', 'exec.js'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  let rel = decodeURIComponent(parsed.pathname || '/');
  if (rel === '/') rel = '/index.html';

  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(PUBLIC_DIR, safe);
  if (!full.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.end('forbidden');
    return;
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    res.statusCode = 404;
    res.end('not found');
    return;
  }
  const ext = path.extname(full).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  fs.createReadStream(full).pipe(res);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  if (parsed.pathname === '/api/exec') {
    return execHandler(req, res);
  }
  if (req.method === 'GET') return serveStatic(req, res);

  res.statusCode = 404;
  res.end('not found');
});

server.listen(PORT, () => {
  console.log(`mini-git playground dev server → http://localhost:${PORT}`);
});
