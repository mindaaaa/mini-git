module.exports = {
  FILE_NOT_FOUND: (filename) =>
    `fatal: '${filename}' 경로명세가 어떤 파일과도 일치하지 않습니다`,
  FILE_ADDED: (filename, hash) =>
    `${filename}이 스테이징 되었습니다. (${hash})`,
};
