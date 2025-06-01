/**
 * ISO 문자열을 Git 로그 형식의 날짜 문자열로 변환합니다.
 * 실제 `git log` 명령어와 유사한 형식으로 표현됩니다.
 *
 * @param {string} isoString ISO 형식의 날짜 문자열 (e.g. new Date().toISOString())
 * @returns {string} Git 로그 스타일로 포맷된 날짜 문자열
 *
 * @example
 * formatGitDate("2025-05-31T13:22:59.000Z"); // 'Sat May 31 22:22:59 2025 +0900'
 */

function formatGitDate(isoString) {
  const date = new Date(isoString);

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });

  const day = String(date.getDate()).padStart(2, '0');
  const time = date.toTimeString().split(' ')[0];
  const year = date.getFullYear();

  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? '+' : '-';
  const absOffset = Math.abs(timezoneOffset);
  const tzHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const tzMinutes = String(absOffset % 60).padStart(2, '0');
  const tzString = `${sign}${tzHours}${tzMinutes}`;

  return `${weekday} ${month} ${day} ${time} ${year} ${tzString}`;
}

module.exports = formatGitDate;
