/**
 * Git 커밋 객체 내용을 파싱하여 구조화된 정보로 반환합니다.
 *
 * 이때, 커밋 객체는 다음 형식으로 구성됩니다.
 * ```
 * tree <tree_hash>
 * parent <parent_hash>
 * author <author_name> <author_email>
 * committer <timestamp>
 *
 * <커밋 메시지>
 * ```
 *
 * @param {Buffer} raw - zlib 압축 해제된 커밋 객체의 원시 데이터
 * @returns {{
 *   tree?: string,
 *   parent?: string,
 *   author?: string,
 *   timestamp?: string,
 *   message: string
 * }} 파싱된 커밋 객체
 *
 */

function parseCommitObject(raw) {
  const text = raw.toString('utf-8');
  const [metaBlock, commitMessageBlock, ...extra] = text.split('\n\n');
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
