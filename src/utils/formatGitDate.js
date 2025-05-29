function formatGitDate(isoString) {
  const date = new Date(isoString);

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });

  // 날짜, 시간 구성
  const day = String(date.getDate()).padStart(2, '0');
  const time = date.toTimeString().split(' ')[0]; // HH:MM:SS
  const year = date.getFullYear();

  const timezoneOffset = -date.getTimezoneOffset(); // 분 단위 (예: 540)
  const sign = timezoneOffset >= 0 ? '+' : '-';
  const absOffset = Math.abs(timezoneOffset);
  const tzHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const tzMinutes = String(absOffset % 60).padStart(2, '0');
  const tzString = `${sign}${tzHours}${tzMinutes}`;

  return `${weekday} ${month} ${day} ${time} ${year} ${tzString}`;
}

module.exports = formatGitDate;
