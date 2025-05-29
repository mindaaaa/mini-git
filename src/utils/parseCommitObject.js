function parseCommitObject(raw) {
  const [part1, part2, ...rest] = raw.split('\n\n');
  const headers = `${part1}\n${part2}`.trim();
  const message = rest.join('\n\n').trim();

  const result = {};
  const headerLines = headers.split('\n');

  for (const line of headerLines) {
    const [key, ...rest] = line.split(' ');
    const value = rest.join(' ');

    if (key === 'tree') {
      result.tree = value;
    } else if (key === 'parent') {
      result.parent = value;
    } else if (key === 'author') {
      result.author = value;
    } else if (key === 'committer') {
      result.timestamp = value;
    }
  }

  result.message = message;
  return result;
}

module.exports = parseCommitObject;
