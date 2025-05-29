module.exports = {
  INIT_ALREADY_EXISTS: (relPath) =>
    `⚠️ 이미 ${relPath}의 깃 저장소가 초기화된 상태입니다.`,
  INIT_SUCCESS: (relPath) =>
    `${relPath} 안의 빈 깃 저장소를 다시 초기화했습니다.`,
  FILE_NOT_FOUND: (filename) =>
    `fatal: '${filename}' 경로명세가 어떤 파일과도 일치하지 않습니다`,
  FILE_ADDED: (filename, hash) =>
    `${filename}이 스테이징 되었습니다. (${hash})`,
  BRANCH_NOT_FOUND: (branch) =>
    `fatal: 브랜치 '${branch}'는 존재하지 않습니다.`,
  CHECKOUT_SUCCESS: (branch) => `'${branch}' 브랜치로 전환되었습니다`,
  BRANCH_ALREADY_EXISTS: (branch) =>
    `fatal: '${branch}'이라는 이름의 브랜치가 이미 존재합니다`,
  BRANCH_CREATED: (branch, hash) =>
    `'${branch}' 브랜치를 생성했습니다 (${hash})`,
};
