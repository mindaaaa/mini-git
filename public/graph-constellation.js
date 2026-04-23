/**
 * Constellation graph renderer.
 *
 * Replaces the legacy vertical SVG layout with a horizontal flow:
 *   trunk(main lineage from HEAD) sits at the bottom, branches diverge upward
 *   and to the right. Time → x-axis. Branch column → y-axis.
 *
 * Output shape:
 *   container (position:relative)
 *     ├─ <svg.graph-svg-layer>   ... branch curves (with glow + crisp pass)
 *     ├─ <span.c-node ...>       ... HTML positioned commit nodes (.head/.feat/.selected)
 *     └─ <span.c-ribbon ...>     ... HEAD / branch / tag pills under each ref'd commit
 *
 * Component CSS lives in public/styles.css under "Constellation components".
 *
 * @param {HTMLElement} container          .graph-area or any positioned container
 * @param {object}      ui                 state.ui — { graph, head, refs:{branches,tags} }
 * @param {object}      [opts]
 * @param {string|null} [opts.selectedHash]
 * @param {(hash:string) => void} [opts.onSelect]
 */
export function renderConstellationGraph(container, ui, opts = {}) {
  container.innerHTML = '';
  container.style.position = 'relative';

  const commits = (ui && ui.graph) || [];
  const head = (ui && ui.head) || null;
  const branches = (ui && ui.refs && ui.refs.branches) || [];
  const tags = (ui && ui.refs && ui.refs.tags) || [];
  const selectedHash = opts.selectedHash || null;
  const onSelect = typeof opts.onSelect === 'function' ? opts.onSelect : () => {};

  if (!commits.length) {
    const empty = document.createElement('div');
    empty.className = 'graph-empty';
    empty.innerHTML = 'run <code>mini-git init</code> then stage a file to see commits.';
    container.appendChild(empty);
    container.style.minWidth = '';
    container.style.minHeight = '';
    return;
  }

  /* trunk = parent chain reachable from HEAD */
  const byHash = new Map(commits.map((c) => [c.hash, c]));
  const trunkSet = new Set();
  let cursor = head && head.hash;
  while (cursor && byHash.has(cursor) && !trunkSet.has(cursor)) {
    trunkSet.add(cursor);
    cursor = byHash.get(cursor).parent;
  }

  /* oldest first → leftmost. position index drives x-coordinate */
  const ordered = [...commits].sort((a, b) => {
    const ta = Date.parse(a.timestamp) || 0;
    const tb = Date.parse(b.timestamp) || 0;
    return ta - tb;
  });
  const positionIndex = new Map(ordered.map((c, i) => [c.hash, i]));

  /* column assignment:
     - trunk commits = column 0
     - non-trunk commits inherit their parent's column if parent is non-trunk,
       otherwise get a fresh column. This keeps a single feature branch in one row. */
  const colIndex = new Map();
  for (const c of ordered) {
    if (trunkSet.has(c.hash)) colIndex.set(c.hash, 0);
  }
  let nextCol = 1;
  for (const c of ordered) {
    if (colIndex.has(c.hash)) continue;
    const parentCol = c.parent && colIndex.has(c.parent) ? colIndex.get(c.parent) : null;
    if (parentCol != null && parentCol > 0) {
      colIndex.set(c.hash, parentCol);
    } else {
      colIndex.set(c.hash, nextCol++);
    }
  }
  const colCount = Math.max(1, nextCol);

  /* layout constants — tuned for ~6-8 commits in 2 columns */
  const stepX = 150;
  const stepY = 110;
  const leftMargin = 100;
  const rightMargin = 300;       /* room for HEAD label + ribbon */
  const topMargin = 60;
  const bottomMargin = 120;      /* room for ribbon under bottom row */
  const width = leftMargin + Math.max(1, ordered.length) * stepX + rightMargin;
  const height = topMargin + colCount * stepY + bottomMargin;

  /* trunk anchored at the bottom row, feature columns above it */
  const trunkY = topMargin + (colCount - 1) * stepY + stepY * 0.6;
  const colY = (col) => trunkY - col * stepY;
  const colX = (idx) => leftMargin + idx * stepX;

  container.style.minWidth = `${width}px`;
  container.style.minHeight = `${height}px`;

  /* ---- SVG layer: branch curves ---- */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'graph-svg-layer');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));

  const defs = document.createElementNS(SVG_NS, 'defs');
  defs.innerHTML = `
    <linearGradient id="graphMain" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="rgba(243,240,232,0.06)" />
      <stop offset="35%"  stop-color="rgba(243,240,232,0.40)" />
      <stop offset="100%" stop-color="rgba(128,255,234,0.85)" />
    </linearGradient>
    <linearGradient id="graphFeat" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="rgba(243,240,232,0.06)" />
      <stop offset="50%"  stop-color="rgba(255,126,182,0.55)" />
      <stop offset="100%" stop-color="rgba(255,126,182,0.85)" />
    </linearGradient>
    <filter id="graphSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" />
    </filter>
  `;
  svg.appendChild(defs);

  /* edges: parent → child. each edge gets a wide blurred glow + crisp 1px pass. */
  for (const c of ordered) {
    if (!c.parent) continue;
    const parent = byHash.get(c.parent);
    if (!parent) continue;
    const x1 = colX(positionIndex.get(parent.hash));
    const y1 = colY(colIndex.get(parent.hash));
    const x2 = colX(positionIndex.get(c.hash));
    const y2 = colY(colIndex.get(c.hash));
    const childCol = colIndex.get(c.hash);
    const isTrunk = childCol === 0 && colIndex.get(parent.hash) === 0;
    const stroke = isTrunk ? 'url(#graphMain)' : 'url(#graphFeat)';

    let d;
    if (y1 === y2) {
      d = `M ${x1} ${y1} L ${x2} ${y2}`;
    } else {
      const cx = (x1 + x2) / 2;
      d = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
    }

    const glow = document.createElementNS(SVG_NS, 'path');
    glow.setAttribute('d', d);
    glow.setAttribute('stroke', stroke);
    glow.setAttribute('stroke-width', isTrunk ? '2.6' : '2.2');
    glow.setAttribute('fill', 'none');
    glow.setAttribute('filter', 'url(#graphSoftGlow)');
    svg.appendChild(glow);

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', '1');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
  }

  container.appendChild(svg);

  /* ---- ref index ---- */
  const refsByHash = new Map();
  for (const b of branches) {
    if (!refsByHash.has(b.hash)) refsByHash.set(b.hash, []);
    refsByHash.get(b.hash).push({
      kind: 'branch',
      name: b.name,
      isHead: head && !head.detached && head.branch === b.name,
    });
  }
  for (const t of tags) {
    if (!refsByHash.has(t.hash)) refsByHash.set(t.hash, []);
    refsByHash.get(t.hash).push({ kind: 'tag', name: t.name });
  }

  /* ---- HTML commit nodes + ribbons ---- */
  for (const c of ordered) {
    const x = colX(positionIndex.get(c.hash));
    const y = colY(colIndex.get(c.hash));
    const col = colIndex.get(c.hash);
    const isHead = head && head.hash === c.hash;
    const isFeature = col > 0;

    const node = document.createElement('span');
    let cls = 'c-node';
    if (isHead) cls += ' head';
    else if (isFeature) cls += ' feat';
    if (selectedHash === c.hash) cls += ' selected';
    node.className = cls;
    node.style.position = 'absolute';
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.transform = 'translate(-50%, -50%)';
    node.title = c.message || '';

    const core = document.createElement('span');
    core.className = 'core';
    node.appendChild(core);

    const halo = document.createElement('span');
    halo.className = 'halo';
    node.appendChild(halo);

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = (c.message || '(no message)').slice(0, 64);
    node.appendChild(label);

    const sub = document.createElement('span');
    sub.className = 'sub';
    const short = c.hash.slice(0, 7);
    const time = formatHHMM(c.timestamp);
    sub.textContent = time ? `${short} · ${time}` : short;
    node.appendChild(sub);

    node.addEventListener('click', () => onSelect(c.hash));
    container.appendChild(node);

    /* ribbons hang under the node, stacked downward */
    const refs = refsByHash.get(c.hash) || [];
    let ribbonOffset = 38;
    for (const r of refs) {
      const ribbon = document.createElement('span');
      let rcls = 'c-ribbon';
      if (r.isHead) rcls += ' head';
      else if (r.kind === 'tag') rcls += ' tag';
      else if (isFeature) rcls += ' feat';
      ribbon.className = rcls;
      ribbon.textContent = r.isHead ? `◆ HEAD → ${r.name}` : r.name;
      ribbon.style.position = 'absolute';
      ribbon.style.left = `${x}px`;
      ribbon.style.top = `${y + ribbonOffset}px`;
      ribbon.style.transform = 'translate(-50%, 0)';
      container.appendChild(ribbon);
      ribbonOffset += 26;
    }
  }
}

function formatHHMM(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
}
