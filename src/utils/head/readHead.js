const fs = require('fs');
const path = require('path');
const { getHeadPath } = require('@utils/path');
const { REF_PREFIX, HEAD_TYPES } = require('@domain/enums');

/**
 * HEAD 파일을 읽고, 참조(ref) 또는 해시 정보를 파싱합니다.
 * 브랜치 기반 HEAD라면 ref 경로를, detached 상태라면 해시 값을 반환합니다.
 *
 * @param {string} gitDir Git 디렉토리 경로
 * @returns {object} HEAD 정보 객체 (type, ref/hash, fullPath)
 */

function readHead(gitDir) {
  const headPath = getHeadPath(gitDir);
  const headContent = fs.readFileSync(headPath, 'utf-8').trim();

  if (headContent.startsWith(REF_PREFIX)) {
    const refPath = headContent.slice(5);
    const fullRefPath = path.join(gitDir, refPath);
    return {
      type: HEAD_TYPES.REF,
      ref: refPath,
      fullPath: fullRefPath,
    };
  }

  return {
    type: HEAD_TYPES.REF,
    hash: headContent,
  };
}

module.exports = readHead;
