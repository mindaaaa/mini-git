/* mini-git playground — client */

import { renderConstellationGraph } from '/graph-constellation.js';

/* =========================================================
 * Storage abstraction (plug a different adapter later if needed)
 * ========================================================= */
class LocalStorageAdapter {
  constructor(namespace = 'mini-git:v1') {
    this.ns = namespace;
  }
  get(key) {
    try {
      const raw = localStorage.getItem(`${this.ns}:${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  set(key, value) {
    try {
      localStorage.setItem(`${this.ns}:${key}`, JSON.stringify(value));
    } catch (err) {
      console.warn('storage full:', err);
    }
  }
  remove(key) {
    localStorage.removeItem(`${this.ns}:${key}`);
  }
  clear() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${this.ns}:`)) localStorage.removeItem(k);
    }
  }
}

const storage = new LocalStorageAdapter();

/* =========================================================
 * App state
 * ========================================================= */
const state = {
  snapshot: storage.get('snapshot') || {},
  ui: storage.get('ui') || null,   /* server-provided UIState (cached) */
  selectedHash: null,              /* selected commit hash for inspector */
  history: storage.get('history') || [],  /* terminal lines */
  pendingFiles: {},                /* virtual-shell writes queued for next /api/exec */
};

function persist() {
  storage.set('snapshot', state.snapshot);
  storage.set('history', state.history.slice(-200));
  storage.set('ui', state.ui);
}

/* =========================================================
 * Client-side snapshot helpers (virtual shell operates on these)
 *
 * snapshot is { [relativePath]: base64Content }. Working tree files
 * live at top-level keys (e.g. "hello.txt"); git objects under ".mini-git/*".
 * ========================================================= */
function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function b64decode(b64) {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

function listWorkingFiles() {
  return Object.keys(state.snapshot)
    .filter((p) => !p.startsWith('.mini-git') && !p.includes('/'))
    .sort();
}
function readWorkingFile(name) {
  const v = state.snapshot[name];
  return v ? b64decode(v) : null;
}
function writeWorkingFile(name, content) {
  state.snapshot[name] = b64encode(content);
  state.pendingFiles[name] = content;
}
function removeWorkingFile(name) {
  delete state.snapshot[name];
  delete state.pendingFiles[name];
}

/* =========================================================
 * API
 * ========================================================= */
async function callExec(command, args) {
  const body = {
    command,
    args,
    snapshot: state.snapshot,
    files: { ...state.pendingFiles },
  };
  state.pendingFiles = {};

  const res = await fetch('/api/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

/* =========================================================
 * Terminal
 * ========================================================= */
const termBody = document.getElementById('terminal-body');
const termInput = document.getElementById('term-input');

function printLine({ kind = 'out', text = '', cls = '' }) {
  const line = document.createElement('div');
  if (kind === 'cmd') {
    line.className = 'term-line';
    const prompt = document.createElement('span');
    prompt.className = 'term-prompt';
    prompt.innerHTML = `<span class="path">${currentPromptPath()}</span> ❯`;
    const cmd = document.createElement('span');
    cmd.className = 'term-cmd';
    cmd.textContent = text;
    line.append(prompt, cmd);
  } else {
    line.className = `term-out ${cls}`;
    line.textContent = text;
  }
  termBody.appendChild(line);
  termBody.scrollTop = termBody.scrollHeight;
  state.history.push({ kind, text, cls });
}

function currentPromptPath() {
  const branch = state.ui?.head?.branch;
  return branch ? `playground (${branch})` : 'playground';
}

function replayHistory() {
  termBody.innerHTML = '';
  for (const h of state.history) {
    const line = document.createElement('div');
    if (h.kind === 'cmd') {
      line.className = 'term-line';
      line.innerHTML = `<span class="term-prompt"><span class="path">playground</span> ❯</span><span class="term-cmd"></span>`;
      line.querySelector('.term-cmd').textContent = h.text;
    } else {
      line.className = `term-out ${h.cls || ''}`;
      line.textContent = h.text;
    }
    termBody.appendChild(line);
  }
  termBody.scrollTop = termBody.scrollHeight;
}

/* =========================================================
 * Virtual shell — handles `touch`, `echo ... > file`, `cat`, `rm`, `ls`, `clear`
 * Anything else starting with `mini-git` is forwarded to the server.
 * ========================================================= */
function handleVirtualShell(raw) {
  const line = raw.trim();
  if (!line) return true;

  /* clear */
  if (line === 'clear' || line === 'cls') {
    state.history = [];
    termBody.innerHTML = '';
    persist();
    return true;
  }

  /* ls */
  if (line === 'ls') {
    const files = listWorkingFiles();
    printLine({ text: files.length ? files.join('  ') : '(empty)' });
    return true;
  }

  /* touch */
  const mTouch = line.match(/^touch\s+(\S+)$/);
  if (mTouch) {
    const name = mTouch[1];
    if (!listWorkingFiles().includes(name)) writeWorkingFile(name, '');
    render();
    persist();
    return true;
  }

  /* rm */
  const mRm = line.match(/^rm\s+(\S+)$/);
  if (mRm) {
    const name = mRm[1];
    if (!state.snapshot[name]) {
      printLine({ text: `rm: ${name}: no such file`, cls: 'err' });
    } else {
      removeWorkingFile(name);
      render();
      persist();
    }
    return true;
  }

  /* echo "..." > file   or   echo foo > file */
  const mEcho = line.match(/^echo\s+(.+?)\s*>\s*(\S+)$/);
  if (mEcho) {
    let content = mEcho[1].trim();
    const name = mEcho[2];
    /* strip matching quotes */
    if ((content.startsWith('"') && content.endsWith('"')) ||
        (content.startsWith("'") && content.endsWith("'"))) {
      content = content.slice(1, -1);
    }
    if (!content.endsWith('\n')) content += '\n';
    writeWorkingFile(name, content);
    render();
    persist();
    return true;
  }

  /* cat */
  const mCat = line.match(/^cat\s+(\S+)$/);
  if (mCat) {
    const name = mCat[1];
    const content = readWorkingFile(name);
    if (content === null) {
      printLine({ text: `cat: ${name}: no such file`, cls: 'err' });
    } else {
      printLine({ text: content.replace(/\n$/, '') });
    }
    return true;
  }

  /* help */
  if (line === 'help') {
    printLine({ text: [
      'mini-git commands:',
      '  mini-git init                    repo 초기화',
      '  mini-git add <file>              파일 스테이징',
      '  mini-git commit <message...>     커밋 생성',
      '  mini-git branch <name>           브랜치 생성',
      '  mini-git checkout <branch>       브랜치 전환',
      '  mini-git log                     커밋 로그',
      '  mini-git cat-file -p <hash>      객체 내용 확인',
      '',
      'virtual shell (클라이언트 처리):',
      '  touch <file>                     빈 파일 생성',
      '  echo "text" > <file>             파일 내용 쓰기',
      '  cat <file>                       파일 읽기',
      '  rm <file>                        파일 삭제',
      '  ls                               파일 목록',
      '  clear                            터미널 클리어',
    ].join('\n')});
    return true;
  }

  return false;  /* not handled — forward to server */
}

/* =========================================================
 * Command submit
 * ========================================================= */
async function submitCommand(raw) {
  const line = raw.trim();
  if (!line) return;

  printLine({ kind: 'cmd', text: line });

  if (handleVirtualShell(line)) {
    persist();
    return;
  }

  /* mini-git <cmd> <args...> */
  const parts = line.split(/\s+/);
  if (parts[0] !== 'mini-git') {
    printLine({ text: `unknown command: '${parts[0]}'. try \`help\`.`, cls: 'err' });
    return;
  }
  const [, command, ...args] = parts;
  if (!command) {
    printLine({ text: 'usage: mini-git <command> [args...]', cls: 'err' });
    return;
  }

  /* strip surrounding quotes from args (e.g. commit "first commit") */
  const cleaned = args.map((a) => {
    if ((a.startsWith('"') && a.endsWith('"')) || (a.startsWith("'") && a.endsWith("'"))) {
      return a.slice(1, -1);
    }
    return a;
  });

  termInput.disabled = true;
  try {
    const result = await callExec(command, cleaned);
    state.snapshot = result.snapshot || {};
    state.ui = result.state;
    if (result.stdout) printLine({ text: result.stdout, cls: 'success' });
    if (result.stderr) printLine({ text: result.stderr, cls: 'err' });
    render();
    persist();
  } catch (err) {
    printLine({ text: `request failed: ${err.message}`, cls: 'err' });
  } finally {
    termInput.disabled = false;
    termInput.focus();
  }
}

/* =========================================================
 * Rendering
 * ========================================================= */
function render() {
  renderWorkingTree();
  renderStagingArea();
  renderRefs();
  renderGraph();
  renderInspector();
  renderStatusBar();
  document.getElementById('prompt-path').textContent = currentPromptPath();
}

function renderWorkingTree() {
  const root = document.getElementById('tree-working');
  root.innerHTML = '';

  /* snapshot = 클라가 소유한 파일시스템 진실, server workingTree = 상태 라벨 소스.
     분기하지 말고 항상 병합한다 (모달/가상쉘 변경이 mini-git 왕복 없이도 보이도록). */
  const snapshotFiles = listWorkingFiles();
  const serverEntries = state.ui?.workingTree || [];
  const serverByPath = new Map(serverEntries.map((e) => [e.path, e]));

  const items = snapshotFiles.map((p) => {
    const server = serverByPath.get(p);
    return server ? server : { path: p, status: '?', hash: null };
  });
  for (const e of serverEntries) {
    if (!snapshotFiles.includes(e.path)) items.push(e);
  }
  items.sort((a, b) => a.path.localeCompare(b.path));

  if (items.length === 0) {
    root.innerHTML = '<div class="empty-hint">no files yet — try `+ new file` or `touch hello.txt`</div>';
    return;
  }

  for (const item of items) {
    const el = document.createElement('div');
    el.className = 'tree-item nested';
    if (item.status === 'M') el.classList.add('modified');
    else if (item.status === 'A') el.classList.add('added');
    else if (item.status === '?') el.classList.add('untracked');
    else if (item.status === 'D') el.classList.add('deleted');
    el.innerHTML = `
      <span class="icon">·</span>
      <span class="name"></span>
      <span class="marker">${item.status}</span>
    `;
    el.querySelector('.name').textContent = item.path;
    el.addEventListener('click', () => openEditor(item.path));
    root.appendChild(el);
  }
}

function renderStagingArea() {
  const root = document.getElementById('tree-staged');
  root.innerHTML = '';
  const index = state.ui?.index || [];
  document.getElementById('stat-staged').textContent = `${index.length} file${index.length === 1 ? '' : 's'}`;
  if (index.length === 0) {
    root.innerHTML = '<div class="empty-hint">nothing staged</div>';
    return;
  }
  for (const entry of index) {
    const el = document.createElement('div');
    el.className = 'tree-item added nested';
    el.innerHTML = `
      <span class="icon">·</span>
      <span class="name"></span>
      <span class="marker">A</span>
    `;
    el.querySelector('.name').textContent = entry.path;
    root.appendChild(el);
  }
}

function renderRefs() {
  const root = document.getElementById('refs-section');
  root.innerHTML = '';
  const ui = state.ui;
  const head = ui?.head;
  const branches = ui?.refs?.branches || [];
  const tags = ui?.refs?.tags || [];
  const total = branches.length + tags.length;
  document.getElementById('ref-count').textContent = `${total} ref${total === 1 ? '' : 's'}`;

  if (!head?.exists) {
    root.innerHTML = '<div class="empty-hint" style="padding-left: 11px">no refs yet</div>';
    return;
  }

  /* HEAD */
  const headLabel = document.createElement('div');
  headLabel.className = 'ref-group-label';
  headLabel.innerHTML = `<span>HEAD</span>`;
  root.appendChild(headLabel);
  const headRef = document.createElement('div');
  headRef.className = 'ref active';
  const headName = head.detached ? '(detached)' : head.branch || '—';
  const headSha = head.hash ? `${head.hash.slice(0, 7)}…` : '—';
  headRef.innerHTML = `
    <div class="ref-dot head"></div>
    <div class="ref-name"></div>
    <div class="ref-sha"></div>
  `;
  headRef.querySelector('.ref-name').textContent = headName;
  headRef.querySelector('.ref-sha').textContent = headSha;
  if (head.hash) headRef.addEventListener('click', () => selectCommit(head.hash));
  root.appendChild(headRef);

  if (branches.length) {
    const lbl = document.createElement('div');
    lbl.className = 'ref-group-label';
    lbl.innerHTML = `<span>Branches</span><span class="n">${branches.length}</span>`;
    root.appendChild(lbl);
    for (const b of branches) {
      const el = document.createElement('div');
      el.className = 'ref';
      if (!head.detached && b.name === head.branch) el.classList.add('active');
      el.innerHTML = `<div class="ref-dot branch"></div><div class="ref-name"></div><div class="ref-sha"></div>`;
      el.querySelector('.ref-name').textContent = b.name;
      el.querySelector('.ref-sha').textContent = `${b.hash.slice(0, 7)}…`;
      el.addEventListener('click', () => selectCommit(b.hash));
      root.appendChild(el);
    }
  }

  if (tags.length) {
    const lbl = document.createElement('div');
    lbl.className = 'ref-group-label';
    lbl.innerHTML = `<span>Tags</span><span class="n">${tags.length}</span>`;
    root.appendChild(lbl);
    for (const t of tags) {
      const el = document.createElement('div');
      el.className = 'ref';
      el.innerHTML = `<div class="ref-dot tag"></div><div class="ref-name"></div><div class="ref-sha"></div>`;
      el.querySelector('.ref-name').textContent = t.name;
      el.querySelector('.ref-sha').textContent = `${t.hash.slice(0, 7)}…`;
      el.addEventListener('click', () => selectCommit(t.hash));
      root.appendChild(el);
    }
  }
}

function renderInspector() {
  const root = document.getElementById('object-panel');
  root.innerHTML = '<div class="panel-header"><span>Object Inspector</span></div>';

  const hash = state.selectedHash;
  if (!hash) {
    const hint = document.createElement('div');
    hint.className = 'inspector-hint';
    hint.innerHTML = 'select a commit node in the graph to inspect its <em>tree</em>, <em>parent</em>, and message here.';
    root.appendChild(hint);
    return;
  }

  const commit = (state.ui?.graph || []).find((c) => c.hash === hash);
  if (!commit) {
    const hint = document.createElement('div');
    hint.className = 'inspector-hint';
    hint.textContent = `object ${hash.slice(0, 7)}… not found in graph.`;
    root.appendChild(hint);
    return;
  }

  const body = document.createElement('div');
  body.innerHTML = `
    <div class="obj-caption">— commit object —</div>
    <div class="obj-title"></div>
    <div class="obj-field">
      <div class="label">sha</div>
      <div class="value sha"></div>
    </div>
    <div class="obj-field">
      <div class="label">tree</div>
      <div class="value"></div>
    </div>
    <div class="obj-field">
      <div class="label">parent</div>
      <div class="value"></div>
    </div>
    <div class="obj-field">
      <div class="label">author</div>
      <div class="value"></div>
    </div>
    <div class="obj-field">
      <div class="label">date</div>
      <div class="value"></div>
    </div>
    <div class="commit-msg"></div>
  `;
  body.querySelector('.obj-title').textContent = commit.message || '(no message)';
  body.querySelectorAll('.obj-field .value')[0].textContent = commit.hash;
  body.querySelectorAll('.obj-field .value')[1].textContent = commit.tree || '—';
  body.querySelectorAll('.obj-field .value')[2].textContent = commit.parent || '(root commit)';
  body.querySelectorAll('.obj-field .value')[3].textContent = commit.author || '—';
  body.querySelectorAll('.obj-field .value')[4].textContent = commit.timestamp || '—';
  body.querySelector('.commit-msg').textContent = commit.message || '';
  root.appendChild(body);
}

function renderStatusBar() {
  const branch = state.ui?.head?.branch || (state.ui?.head?.detached ? '(detached)' : '—');
  const objects = countObjects();
  const staged = state.ui?.index?.length || 0;
  document.getElementById('status-branch').textContent = branch;
  document.getElementById('status-objects').textContent = objects;
  document.getElementById('status-staged').textContent = staged;
  document.getElementById('crumb-branch').textContent = branch;
  document.getElementById('stat-obj').textContent = objects;
  const refCount = (state.ui?.refs?.branches?.length || 0) + (state.ui?.refs?.tags?.length || 0);
  document.getElementById('stat-ref').textContent = refCount;
}

function countObjects() {
  return Object.keys(state.snapshot).filter((k) => k.startsWith('.mini-git/objects/') && !k.endsWith('/')).length;
}

function selectCommit(hash) {
  state.selectedHash = hash;
  renderInspector();
  renderGraph();
}

/* =========================================================
 * Commit graph — delegates to graph-constellation module.
 * 노드/곡선/리본은 모두 거기서 emit. 여기서는 컨테이너 + state 어댑팅만.
 * ========================================================= */
function renderGraph() {
  const area = document.getElementById('graph-area');
  renderConstellationGraph(area, state.ui || {}, {
    selectedHash: state.selectedHash,
    onSelect: selectCommit,
  });
}

/* =========================================================
 * File editor modal
 * ========================================================= */
const modal = document.getElementById('modal-backdrop');
const modalFilename = document.getElementById('modal-filename');
const modalContent = document.getElementById('modal-content');
const modalTitle = document.getElementById('modal-title');

let modalMode = 'new';
function openEditor(filename) {
  modalMode = filename ? 'edit' : 'new';
  modalTitle.textContent = filename ? `Edit · ${filename}` : 'New file';
  modalFilename.value = filename || '';
  modalFilename.disabled = !!filename;
  modalContent.value = filename ? (readWorkingFile(filename) || '') : '';
  modal.classList.add('open');
  setTimeout(() => (filename ? modalContent : modalFilename).focus(), 0);
}
function closeEditor() { modal.classList.remove('open'); }
function saveEditor() {
  const name = modalFilename.value.trim();
  if (!name) { modalFilename.focus(); return; }
  if (name.includes('/') || name.includes('..')) {
    printLine({ text: `invalid filename: ${name}`, cls: 'err' });
    closeEditor();
    return;
  }
  writeWorkingFile(name, modalContent.value);
  closeEditor();
  render();
  persist();
}

/* =========================================================
 * Preset gallery
 * ========================================================= */
const presetBackdrop = document.getElementById('preset-backdrop');
const presetGallery = document.getElementById('preset-gallery');

let presetsCache = null;

async function loadPresetList() {
  if (presetsCache) return presetsCache;
  try {
    const res = await fetch('/presets.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    presetsCache = await res.json();
    return presetsCache;
  } catch (err) {
    console.error('failed to load presets:', err);
    return [];
  }
}

function renderPresetGallery(presets) {
  presetGallery.innerHTML = '';
  if (!presets.length) {
    presetGallery.innerHTML = '<div class="preset-loading">프리셋을 불러오지 못했습니다.</div>';
    return;
  }
  for (const preset of presets) {
    const fileCount = Object.keys(preset.files || {}).length;
    const cmdCount = (preset.suggestedCommands || []).length;
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.innerHTML = `
      <div class="preset-card-title"></div>
      <div class="preset-card-desc"></div>
      <div class="preset-card-meta">
        <span><b>${fileCount}</b> file${fileCount === 1 ? '' : 's'}</span>
        <span><b>${cmdCount}</b> command${cmdCount === 1 ? '' : 's'}</span>
      </div>
    `;
    card.querySelector('.preset-card-title').textContent = preset.title;
    card.querySelector('.preset-card-desc').textContent = preset.description;
    card.addEventListener('click', () => {
      if (hasExistingWork() &&
          !confirm(`"${preset.title}" 프리셋을 로드하면 현재 세션이 초기화됩니다. 계속할까요?`)) {
        return;
      }
      applyPreset(preset);
    });
    presetGallery.appendChild(card);
  }
}

function hasExistingWork() {
  return Object.keys(state.snapshot).length > 0 || state.history.length > 0;
}

function applyPreset(preset) {
  /* reset like the RESET button */
  storage.clear();
  state.snapshot = {};
  state.ui = null;
  state.selectedHash = null;
  state.history = [];
  state.pendingFiles = {};
  termBody.innerHTML = '';

  /* seed working tree from preset files */
  for (const [name, content] of Object.entries(preset.files || {})) {
    writeWorkingFile(name, content);
  }

  printLine({ text: `preset loaded: ${preset.title}`, cls: 'success' });
  if (preset.description) printLine({ text: preset.description });

  const cmds = preset.suggestedCommands || [];
  if (cmds.length) {
    printLine({ text: '' });
    printLine({ text: 'suggested commands — copy & run one at a time:', cls: 'success' });
    for (const cmd of cmds) printLine({ text: `  ${cmd}` });
  }

  render();
  persist();
  closePresetGallery();
}

async function openPresetGallery() {
  presetBackdrop.classList.add('open');
  const presets = await loadPresetList();
  renderPresetGallery(presets);
}
function closePresetGallery() {
  presetBackdrop.classList.remove('open');
}

/* =========================================================
 * Wire up events
 * ========================================================= */
document.getElementById('btn-new-file').addEventListener('click', () => openEditor(null));
document.getElementById('btn-reset').addEventListener('click', () => {
  if (!confirm('현재 세션을 모두 지우고 다시 시작할까요?')) return;
  storage.clear();
  state.snapshot = {};
  state.ui = null;
  state.selectedHash = null;
  state.history = [];
  state.pendingFiles = {};
  termBody.innerHTML = '';
  render();
  printLine({ text: 'session cleared. run `mini-git init` to begin.', cls: 'success' });
});
document.getElementById('modal-cancel').addEventListener('click', closeEditor);
document.getElementById('modal-save').addEventListener('click', saveEditor);
modal.addEventListener('click', (e) => { if (e.target === modal) closeEditor(); });

document.getElementById('btn-presets').addEventListener('click', openPresetGallery);
document.getElementById('preset-close').addEventListener('click', closePresetGallery);
presetBackdrop.addEventListener('click', (e) => {
  if (e.target === presetBackdrop) closePresetGallery();
});

termInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const value = termInput.value;
    termInput.value = '';
    submitCommand(value);
  }
});

/* =========================================================
 * Bootstrap
 * ========================================================= */
function bootstrap() {
  replayHistory();
  render();   /* instant restore from cached snapshot + ui */
  if (!state.history.length) {
    printLine({ text: 'welcome to mini-git playground. type `help` to see commands.', cls: 'success' });
  }
  termInput.focus();
}

bootstrap();
