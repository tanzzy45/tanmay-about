const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Short, rounded-down duration: `34s`, `45m`, `3h 12m`, `2d 4h`. */
export function formatDuration(ms: number): string {
  const t = Math.max(0, ms);
  if (t < MINUTE) return `${Math.floor(t / 1000)}s`;
  if (t < HOUR) return `${Math.floor(t / MINUTE)}m`;
  if (t < DAY) return joinUnits(Math.floor(t / HOUR), 'h', Math.floor((t % HOUR) / MINUTE), 'm');
  return joinUnits(Math.floor(t / DAY), 'd', Math.floor((t % DAY) / HOUR), 'h');
}

function joinUnits(major: number, majorUnit: string, minor: number, minorUnit: string): string {
  return minor > 0 ? `${major}${majorUnit} ${minor}${minorUnit}` : `${major}${majorUnit}`;
}
