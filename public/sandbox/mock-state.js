/**
 * Shared mock state for all sandbox component pages.
 * Matches the 6-commit narrative used in design-2-constellation.html
 * so visuals stay consistent across the catalog.
 *
 * Shape mirrors the live `state.ui` object that `app.js` builds from
 * `/api/exec` responses — see app.js renderGraph() / renderInspector() for usage.
 */

export const mockHead = {
  hash: '99991115b1cd34f8a2e0c7d9b4f1e5a3c8d7e6b5',
  branch: 'main',
  detached: false,
};

export const mockBranches = [
  { name: 'main',    hash: '99991115b1cd34f8a2e0c7d9b4f1e5a3c8d7e6b5' },
  { name: 'feature', hash: 'd8d9e0f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1' },
];

export const mockTags = [];

export const mockCommits = [
  {
    hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    parent: null,
    message: 'init readme',
    timestamp: '2026-04-24T14:02:00+09:00',
    author: 'minda',
  },
  {
    hash: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
    parent: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    message: 'add hello.txt',
    timestamp: '2026-04-24T14:08:00+09:00',
    author: 'minda',
  },
  {
    hash: '7890cde4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8',
    parent: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
    message: 'refactor parser',
    timestamp: '2026-04-24T14:21:00+09:00',
    author: 'minda',
  },
  {
    hash: 'f1f2a3a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4',
    parent: '7890cde4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8',
    message: 'feat: add login form',
    timestamp: '2026-04-24T14:35:00+09:00',
    author: 'minda',
  },
  {
    hash: 'd8d9e0f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1',
    parent: 'f1f2a3a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4',
    message: 'feat: tests for login',
    timestamp: '2026-04-24T14:48:00+09:00',
    author: 'minda',
  },
  {
    hash: '99991115b1cd34f8a2e0c7d9b4f1e5a3c8d7e6b5',
    parent: '7890cde4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8',
    message: 'fix: typo in greeting message',
    timestamp: '2026-04-24T15:02:00+09:00',
    author: 'minda',
  },
];

export const mockUiState = {
  head: mockHead,
  graph: mockCommits,
  refs: {
    branches: mockBranches,
    tags: mockTags,
  },
  index: [],
  workingTree: [
    { path: 'README.md',  status: 'tracked' },
    { path: 'hello.txt',  status: 'tracked' },
    { path: 'parser.js',  status: 'tracked' },
  ],
};

/** Mock object lookup: tree contents per commit hash. */
export const mockTrees = {
  'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0': [
    { name: 'README.md', sha: 'd3486ae9136e7' },
  ],
  'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3': [
    { name: 'README.md', sha: 'd3486ae9136e7' },
    { name: 'hello.txt', sha: 'b6fc4c620b67d' },
  ],
  '7890cde4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8': [
    { name: 'README.md', sha: 'd3486ae9136e7' },
    { name: 'hello.txt', sha: 'b6fc4c620b67d' },
    { name: 'parser.js', sha: 'a82b8f7e1290c' },
  ],
  '99991115b1cd34f8a2e0c7d9b4f1e5a3c8d7e6b5': [
    { name: 'README.md', sha: 'd3486ae9136e7' },
    { name: 'hello.txt', sha: 'b6fc4c620b67d' },
    { name: 'parser.js', sha: 'a82b8f7e1290c' },
  ],
  'f1f2a3a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4': [
    { name: 'README.md', sha: 'd3486ae9136e7' },
    { name: 'hello.txt', sha: 'b6fc4c620b67d' },
    { name: 'login.js',  sha: 'c92a4f1e88203' },
  ],
  'd8d9e0f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1': [
    { name: 'README.md',     sha: 'd3486ae9136e7' },
    { name: 'hello.txt',     sha: 'b6fc4c620b67d' },
    { name: 'login.js',      sha: 'c92a4f1e88203' },
    { name: 'login.test.js', sha: 'f17d3e09bb4ca' },
  ],
};

export const short = (hash, n = 7) => (hash || '').slice(0, n);
