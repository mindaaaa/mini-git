function parseCommitObject(raw) {
  const [metaBlock, commitMessageBlock, ...extra] = raw.split('\n\n');
  const headers = `${metaBlock}\n${commitMessageBlock}`.trim();
  const message = [...extra].join('\n\n').trim();

  const result = {};
  const headerLines = headers.split('\n');

  const handlers = {
    tree: (value) => (result.tree = value),
    parent: (value) => (result.parent = value),
    author: (value) => (result.author = value),
    committer: (value) => (result.timestamp = value),
  };

  for (const line of headerLines) {
    const [key, ...rest] = line.split(' ');
    const value = rest.join(' ');

    const handler = handlers[key];
    if (handler) handler(value);
  }

  result.message = message;
  return result;
}

module.exports = parseCommitObject;
