function parseCommitObject(raw) {
  const [headers, ...messageLines] = raw.split('\n\n');
  const lines = headers.split('\n');
  const result = {};

  const handlers = {
    tree: (line) => (result.tree = line.slice(5)),
    parent: (line) => (result.parent = line.slice(7)),
    author: (line) => (result.author = line.slice(7)),
    committer: (line) => (result.timestamp = line.slice(10)),
  };

  for (const line of lines) {
    const key = line.split(' ')[0];
    if (handlers[key]) handlers[key](line);
  }

  result.message = messageLines.join('\n').trim();
  return result;
}

module.exports = parseCommitObject;
