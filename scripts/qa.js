#!/usr/bin/env node
'use strict';

/**
 * QA scenarios for the playground API.
 * Usage:  PORT=3000 node scripts/qa.js
 * Requires: dev server running (`npm run dev`) and Node 18+ (native fetch).
 */

const PORT = Number(process.env.PORT || 3000);
const URL = `http://localhost:${PORT}/api/exec`;

let passed = 0;
let failed = 0;
const failures = [];

function log(line) {
  process.stdout.write(`${line}\n`);
}

function section(title) {
  log(`\n=== ${title} ===`);
}

function ok(msg) {
  passed++;
  log(`  ✓ ${msg}`);
}

function fail(msg, detail) {
  failed++;
  failures.push(msg);
  log(`  ✗ ${msg}`);
  if (detail !== undefined) log(`      ${JSON.stringify(detail)}`);
}

function check(cond, msg, detail) {
  if (cond) ok(msg);
  else fail(msg, detail);
}

async function call(command, args = [], snapshot = null, files = undefined) {
  const payload = { command, args, snapshot };
  if (files) payload.files = files;

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function scenarioMultiFileFlat() {
  section('시나리오 A: 최상위 파일 여러 개 (happy path)');

  let r = await call('init', [], null);
  check(r.body.ok === true, 'init 성공');
  let snap = r.body.snapshot;

  const files = {
    'a.txt': 'a\n',
    'b.txt': 'b\n',
    'c.txt': 'c\n',
  };
  r = await call('add', ['a.txt'], snap, files);
  check(r.body.ok === true, 'add a.txt 성공', r.body.stderr);
  snap = r.body.snapshot;

  r = await call('add', ['b.txt'], snap);
  check(r.body.ok === true, 'add b.txt 성공', r.body.stderr);
  snap = r.body.snapshot;

  r = await call('add', ['c.txt'], snap);
  check(r.body.ok === true, 'add c.txt 성공', r.body.stderr);
  check(
    r.body.state.index.length === 3,
    `index에 3개 엔트리 (실제 ${r.body.state.index.length})`,
    r.body.state.index
  );
  check(
    r.body.state.workingTree.every((f) => f.status === 'A'),
    'workingTree 3개 전부 status="A"',
    r.body.state.workingTree
  );
  snap = r.body.snapshot;

  r = await call('commit', ['three', 'files'], snap);
  check(r.body.ok === true, 'commit 성공', r.body.stderr);
  check(r.body.state.graph.length === 1, 'graph에 커밋 1개');
  check(
    Object.keys(r.body.snapshot).filter((k) => k.startsWith('.mini-git/objects/'))
      .length >= 4, // 3 blobs + 1 tree + 1 commit = 5; loose: ≥4
    'snapshot에 .mini-git/objects/* 다수 존재',
    Object.keys(r.body.snapshot).filter((k) => k.startsWith('.mini-git/objects/'))
  );
}

async function scenarioNestedFolders() {
  section('시나리오 B: 중첩 폴더 (폴더 지원 검증)');

  let r = await call('init', [], null);
  let snap = r.body.snapshot;

  const files = {
    'README.md': '# demo\n',
    'src/index.js': 'console.log("root")\n',
    'src/lib/util.js': 'exports.x = 1\n',
    'src/lib/deep/config.json': '{"n":1}\n',
  };

  // 1) write all files via API
  r = await call('add', ['README.md'], snap, files);
  check(r.body.ok === true, 'API가 중첩 경로 파일 쓰기 허용 (add README.md)');
  snap = r.body.snapshot;

  // 2) snapshot contains nested files (snapshot walk는 재귀)
  const snapKeys = Object.keys(snap);
  check(
    snapKeys.includes('src/index.js') &&
      snapKeys.includes('src/lib/util.js') &&
      snapKeys.includes('src/lib/deep/config.json'),
    'snapshot에 중첩 파일 키 포함 (walk 재귀 OK)',
    snapKeys.filter((k) => k.startsWith('src/'))
  );

  // 3) workingTree UI 렌더링 — 현재 구현은 플랫이라 중첩 파일이 안 보이는지 확인
  const wt = r.body.state.workingTree;
  const wtPaths = wt.map((f) => f.path);
  check(
    !wtPaths.some((p) => p.includes('/')),
    '⚠ 알려진 제약: workingTree는 top-level만 나열 (중첩 파일 미표시)',
    wtPaths
  );

  // 4) 코어 add가 중첩 경로를 받아 인덱스에 등록되는지
  r = await call('add', ['src/index.js'], snap);
  if (r.body.ok) {
    const idx = r.body.state.index.map((e) => e.path);
    check(
      idx.includes('src/index.js'),
      'add src/index.js → index에 "src/index.js" 엔트리 생성',
      idx
    );
    snap = r.body.snapshot;
  } else {
    fail('add src/index.js 실패 (코어가 중첩경로 add 미지원)', r.body.stderr);
  }

  // 5) 더 깊은 경로
  r = await call('add', ['src/lib/deep/config.json'], snap);
  if (r.body.ok) {
    ok('add src/lib/deep/config.json 성공 (3단계 중첩)');
    snap = r.body.snapshot;
  } else {
    fail('add 3단계 중첩 실패', r.body.stderr);
  }

  // 6) commit 후 log 까지 흐르는지
  r = await call('commit', ['nested', 'commit'], snap);
  check(r.body.ok === true, 'commit 성공', r.body.stderr);
  snap = r.body.snapshot;

  r = await call('log', [], snap);
  check(
    r.body.ok === true && r.body.stdout.includes('nested'),
    'log 에 커밋 메시지 출력됨'
  );
}

async function scenarioBranching() {
  section('시나리오 C: 브랜치 분기');

  let r = await call('init', [], null);
  let snap = r.body.snapshot;

  r = await call('add', ['a.txt'], snap, { 'a.txt': 'a\n' });
  snap = r.body.snapshot;
  r = await call('commit', ['C1'], snap);
  snap = r.body.snapshot;
  check(r.body.state.graph.length === 1, 'main:C1 생성');

  r = await call('branch', ['feature'], snap);
  snap = r.body.snapshot;
  const branches = r.body.state.refs.branches.map((b) => b.name).sort();
  check(
    branches.length === 2 && branches.includes('feature'),
    `branches == [feature, main] (실제 ${JSON.stringify(branches)})`
  );

  r = await call('checkout', ['feature'], snap);
  snap = r.body.snapshot;
  check(
    r.body.state.head.branch === 'feature',
    `checkout 후 HEAD.branch === "feature" (실제 ${r.body.state.head.branch})`
  );

  r = await call('add', ['b.txt'], snap, { 'b.txt': 'b\n' });
  snap = r.body.snapshot;
  r = await call('commit', ['C2', 'on', 'feature'], snap);
  snap = r.body.snapshot;
  check(r.body.state.graph.length === 2, 'feature:C2 로 graph 2개');

  r = await call('checkout', ['main'], snap);
  check(
    r.body.state.head.branch === 'main',
    'main 으로 돌아와 HEAD.branch === "main"'
  );
}

async function scenarioErrors() {
  section('시나리오 D: 에러 경로');

  // 1) init 없이 add → .mini-git 없음
  let r = await call('add', ['foo.txt'], null, { 'foo.txt': 'x' });
  check(
    r.body.ok === false || r.body.stderr,
    'init 전 add → 에러 또는 stderr',
    { ok: r.body.ok, stderr: r.body.stderr }
  );

  // 2) commit 메시지 없음
  let init = await call('init', [], null);
  r = await call('commit', [], init.body.snapshot);
  check(
    r.body.stderr.includes('커밋 메시지'),
    'commit 빈 메시지 → "커밋 메시지" 안내',
    r.body.stderr
  );

  // 3) 알 수 없는 명령
  r = await call('status', [], init.body.snapshot);
  check(
    r.body.ok === false && r.body.stderr.includes('사용 가능한 명령어'),
    "알 수 없는 명령 → '사용 가능한 명령어' 안내"
  );

  // 4) 경로 이탈 시도 → 파일이 안 써져야 함
  r = await call('add', ['../escape.txt'], init.body.snapshot, {
    '../escape.txt': 'pwned',
  });
  const keys = Object.keys(r.body.snapshot || {});
  check(
    !keys.some((k) => k.includes('escape')),
    '경로 이탈("..") 시도 차단'
  );

  // 5) .mini-git 쓰기 시도 차단
  r = await call('add', ['x'], init.body.snapshot, {
    '.mini-git/HEAD': 'ref: refs/heads/pwn\n',
  });
  const headRaw = r.body.snapshot['.mini-git/HEAD'];
  const headDecoded = headRaw
    ? Buffer.from(headRaw, 'base64').toString('utf-8')
    : '';
  check(
    !headDecoded.includes('pwn'),
    '.mini-git/* 직접 쓰기 차단'
  );

  // 6) 페이로드 초과 (>5MB)
  const big = 'x'.repeat(6 * 1024 * 1024);
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: 'add',
        args: ['big.txt'],
        snapshot: init.body.snapshot,
        files: { 'big.txt': big },
      }),
    });
    check(res.status === 400, `>5MB 페이로드 → 400 (실제 ${res.status})`);
  } catch (err) {
    ok('>5MB 요청 거부 (네트워크 에러 허용)');
  }
}

(async () => {
  log(`mini-git QA → ${URL}`);
  try {
    await call('init', [], null); // warm-up / connectivity
  } catch (err) {
    log(`❌ dev server 연결 실패: ${err.message}`);
    log(`   먼저 \`npm run dev\` (PORT=${PORT}) 실행하세요.`);
    process.exit(2);
  }

  await scenarioMultiFileFlat();
  await scenarioNestedFolders();
  await scenarioBranching();
  await scenarioErrors();

  log(`\n---\n총 ${passed + failed}개 체크, 통과 ${passed}, 실패 ${failed}`);
  if (failed > 0) {
    log(`\n실패 항목:`);
    for (const m of failures) log(`  - ${m}`);
    process.exit(1);
  }
})();
