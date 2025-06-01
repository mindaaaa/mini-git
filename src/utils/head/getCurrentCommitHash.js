const fs = require('fs');
const readHead = require('./readHead');
const { HEAD_TYPES } = require('@domain/enums');
const { INVALID_HEAD_REF } = require('@domain/messages');

/**
 * 현재 HEAD가 가리키는 커밋 해시를 반환합니다.
 * 브랜치 기반이면 ref 파일을 읽고, detached 상태면 바로 해시를 반환합니다.
 *
 * @param {string} gitDir Git 디렉토리 경로
 * @returns {string|null} 현재 커밋 해시
 */

function getCurrentCommitHash(gitDir) {
  const head = readHead(gitDir);

  if (head.type === HEAD_TYPES.DETACHED) {
    return head.hash;
  }

  if (!fs.existsSync(head.fullPath)) {
    console.error(INVALID_HEAD_REF(head.ref));
    return null;
  }

  return fs.readFileSync(head.fullPath, 'utf-8').trim();
}

module.exports = getCurrentCommitHash;
