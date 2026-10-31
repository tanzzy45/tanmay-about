import { describe, expect, it } from 'vitest';
import { formatDuration } from '../src/lib/format';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatDuration', () => {
  it.each([
    [34_000, '34s'],
    [59 * MINUTE + 46_000, '59m'],
    [3 * HOUR, '3h'],
    [3 * HOUR + 12 * MINUTE, '3h 12m'],
    [2 * DAY + 4 * HOUR + 30 * MINUTE, '2d 4h'],
    [-5_000, '0s'],
  ])('formats %i ms as %s', (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });
});
