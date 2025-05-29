function splitHash(hash) {
  const dir = hash.slice(0, 2);
  const file = hash.slice(2);
  return { dir, file };
}

module.exports = splitHash;
